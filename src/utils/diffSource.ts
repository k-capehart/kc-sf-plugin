// Much of the code in this file is taken from: https://github.com/salesforcecli/plugin-deploy-retrieve

import { isAbsolute, relative, resolve } from 'node:path';

import { ux } from '@oclif/core';
import { StandardColors } from '@salesforce/sf-plugins-core';
import chalk from 'chalk';
import { Messages, Org, SfProject } from '@salesforce/core';
import {
  ComponentSet,
  DestructiveChangesType,
  ForceIgnore,
  MetadataResolver,
  VirtualTreeContainer,
  MetadataType,
  SourceComponent,
  RegistryAccess,
  ComponentSetBuilder,
} from '@salesforce/source-deploy-retrieve';
import { filePathsFromMetadataComponent } from '@salesforce/source-deploy-retrieve/lib/src/utils/filePathGenerator.js';

import { SourceTracking } from '@salesforce/source-tracking';
import { Optional } from '@salesforce/ts-types';
import { KcDiffFlags, SourceTrackInformation } from '../commands/kc/diff.js';
import { API, isSourceComponentWithXml } from './types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'previewMessages');

type BaseOperation = 'deploy' | 'retrieve';

export type PreviewFile = {
  fullName: string;
  type: string;
  conflict: boolean;
  ignored: boolean;
  path?: string;
  projectRelativePath?: string;
  operation?: BaseOperation | 'deletePost' | 'deletePre';
};

export type PreviewResult = {
  ignored: PreviewFile[];
  conflicts: PreviewFile[];
  toDeploy: PreviewFile[];
  toDelete: PreviewFile[];
  toRetrieve: PreviewFile[];
};

export type DeployOptions = {
  api: API;
  'target-org': string;
  'api-version'?: string;
  manifest?: string;
  metadata?: string[];
  'source-dir'?: string[];
  concise?: boolean;
};

/** Manifest is expected.  You cannot pass metadata and source-dir array--use those to get a manifest */
export type CachedOptions = Omit<DeployOptions, 'wait' | 'metadata' | 'source-dir'> & {
  wait: number;
  /** whether the user passed in anything for metadata-dir (could be a folder, could be a zip) */
  isMdapi: boolean;
} & Partial<Pick<DeployOptions, 'manifest'>>;

const ensureAbsolutePath = (f: string): string => (isAbsolute(f) ? f : resolve(f));

const resolvePaths = (
  filenames: string[],
  registry?: RegistryAccess
): Array<Pick<PreviewFile, 'type' | 'fullName' | 'path'>> => {
  // component set generated from the filenames on all local changes
  const resolver = new MetadataResolver(registry, VirtualTreeContainer.fromFilePaths(filenames), false);
  const sourceComponents = filenames
    .flatMap((filename) => {
      try {
        return resolver.getComponentsFromPath(filename);
      } catch (e) {
        // resolver will do logging before throw we don't do it here
        return [];
      }
    })
    .filter(isSourceComponentWithXml)
    .map((sc) => ({ fullName: sc.fullName, type: sc.type.name, path: ensureAbsolutePath(sc.xml) }));
  // dedupe by xml path
  return Array.from(new Map(sourceComponents.map((sc) => [sc.path, sc])).values());
};

const calculateDeployOperation = (destructiveChangesType?: DestructiveChangesType): PreviewFile['operation'] => {
  switch (destructiveChangesType) {
    case DestructiveChangesType.POST:
      return 'deletePost';
    case DestructiveChangesType.PRE:
      return 'deletePre';
    default:
      return 'deploy';
  }
};

const getNonIgnoredConflicts = (files: PreviewFile[]): PreviewFile[] => files.filter((f) => f.conflict && !f.ignored);

const willGo = (previewFile: PreviewFile): boolean => !previewFile.conflict && !previewFile.ignored;

const getWillDeploy = (files: PreviewFile[]): PreviewFile[] =>
  files.filter(willGo).filter((f) => f.operation === 'deploy');

const getWillRetrieve = (files: PreviewFile[]): PreviewFile[] =>
  files.filter(willGo).filter((f) => f.operation === 'retrieve');

const getWillDelete = (files: PreviewFile[]): PreviewFile[] =>
  files.filter(willGo).filter((f) => f.operation && ['deletePre', 'deletePost'].includes(f.operation));

// relative paths are easier on tables
const columns = { type: {}, fullName: {}, projectRelativePath: { header: 'Path' } };
const makeKey = ({ type, fullName }: { type: MetadataType; fullName: string }): string => `${type.name}#${fullName}`;

export const compileResults = ({
  componentSet,
  projectPath,
  filesWithConflicts,
  forceIgnore,
  baseOperation,
  remoteDeletes,
}: {
  componentSet: ComponentSet;
  projectPath: string;
  filesWithConflicts: Set<string>;
  forceIgnore: ForceIgnore;
  baseOperation: BaseOperation;
  remoteDeletes?: SourceComponent[];
}): PreviewResult => {
  // when we iterate all the componentSet,
  // this map makes it easy to get the source-backed local components
  const sourceBackedComponents = new Map<string, SourceComponent>(
    componentSet.getSourceComponents().map((sc) => [makeKey({ type: sc.type, fullName: sc.fullName }), sc])
  );

  const sourceComponentToPreviewFile = (c: SourceComponent): Omit<PreviewFile, 'operation'> => ({
    type: c.type.name,
    fullName: c.fullName,
    conflict: [c.xml, c.content].some((v) => v && filesWithConflicts.has(v)),
    // There should not be anything in forceignore returned by the componentSet
    ignored: [c.xml, c.content].some((v) => v && forceIgnore.denies(v)),
    // properties to return if we have an xml path
    ...getPaths(c),
  });

  /** resolve absolute and relative paths for a source component, with a preference for the xml file, but able to use the content file as backup */
  const getPaths = (c: SourceComponent): Pick<PreviewFile, 'path' | 'projectRelativePath'> => {
    const someFile = c.xml ?? c.content;
    if (someFile) {
      return {
        path: isAbsolute(someFile) ? someFile : resolve(someFile),
        // for cleaner output
        projectRelativePath: relative(projectPath, someFile),
      };
    }
    return {};
  };

  const actionableFiles = componentSet
    .filter((f) => f.fullName !== '*')
    .toArray()
    .map((c) => sourceBackedComponents.get(makeKey(c)) ?? c)
    .map((cmp): PreviewFile => {
      const maybeSourceBackedComponent = sourceBackedComponents.get(makeKey(cmp)) ?? cmp;
      if ('xml' in maybeSourceBackedComponent) {
        // source backed components exist locally
        return {
          ...sourceComponentToPreviewFile(maybeSourceBackedComponent),
          operation:
            baseOperation === 'deploy'
              ? calculateDeployOperation(maybeSourceBackedComponent.getDestructiveChangesType())
              : baseOperation,
        };
      } else {
        return {
          type: maybeSourceBackedComponent.type.name,
          fullName: maybeSourceBackedComponent.fullName,
          // if it doesn't exist locally, it can't be a conflict
          conflict: false,
          operation: baseOperation,
          // we have to calculate the "potential filename" to know if a remote retrieve would be ignored
          ignored: filePathsFromMetadataComponent(maybeSourceBackedComponent).some((p) => forceIgnore.denies(p)),
        };
      }
    })
    // remote deletes are not in the componentSet
    .concat(
      (remoteDeletes ?? []).map(
        (c): PreviewFile => ({
          ...sourceComponentToPreviewFile(c),
          operation: 'deletePre',
        })
      )
    );

  // Source backed components won't appear in the ComponentSet if ignored
  const ignoredSourceComponents = resolvePaths(
    [...(componentSet.forceIgnoredPaths ?? [])],
    new RegistryAccess(undefined, projectPath)
  ).map(
    (resolved): PreviewFile => ({
      ...resolved,
      ...(resolved.path ? { projectRelativePath: relative(projectPath, resolved.path) } : {}),
      conflict: false,
      ignored: true,
    })
  );

  return {
    ignored: ignoredSourceComponents.concat(actionableFiles.filter((f) => f.ignored)),
    toDeploy: getWillDeploy(actionableFiles),
    toRetrieve: getWillRetrieve(actionableFiles),
    toDelete: getWillDelete(actionableFiles),
    conflicts: getNonIgnoredConflicts(actionableFiles),
  };
};

const printDeployTable = (files: PreviewFile[], deletedFiles: PreviewFile[]): void => {
  ux.log();
  if (files.length === 0 && deletedFiles.length === 0) {
    ux.log(chalk.dim(messages.getMessage('deploy.none')));
  } else {
    // not using table title property to avoid all the ASCII art
    ux.log(
      StandardColors.success(chalk.bold(messages.getMessage('deploy.header', [files.length + deletedFiles.length])))
    );
    if (files.length !== 0) {
      ux.log(chalk.dim(messages.getMessage('deployChanges.header', [files.length])));
      ux.table<PreviewFile>(files, columns);
    } else {
      ux.log(chalk.dim(messages.getMessage('deployChanges.none')));
    }
    if (deletedFiles.length !== 0) {
      ux.log(chalk.dim(messages.getMessage('deployDeletes.header', [deletedFiles.length])));
      ux.table<PreviewFile>(deletedFiles, columns);
    } else {
      ux.log(chalk.dim(messages.getMessage('deployDeletes.none')));
    }
  }
};

const printRetrieveTable = (files: PreviewFile[], deletedFiles: PreviewFile[]): void => {
  ux.log();
  if (files.length === 0 && deletedFiles.length === 0) {
    ux.log(chalk.dim(messages.getMessage('retrieve.none')));
  } else {
    // not using table title property to avoid all the ASCII art
    ux.log(
      StandardColors.success(chalk.bold(messages.getMessage('retrieve.header', [files.length + deletedFiles.length])))
    );
    if (files.length !== 0) {
      ux.log(chalk.dim(messages.getMessage('retrieveChanges.header', [files.length])));
      ux.table<PreviewFile>(files, columns);
    } else {
      ux.log(chalk.dim(messages.getMessage('retrieveChanges.none')));
    }
    if (deletedFiles.length !== 0) {
      ux.log(chalk.dim(messages.getMessage('retrieveDeletes.header', [deletedFiles.length])));
      ux.table<PreviewFile>(deletedFiles, columns);
    } else {
      ux.log(chalk.dim(messages.getMessage('retrieveDeletes.none')));
    }
  }
};

const printConflictsTable = (files: PreviewFile[]): void => {
  ux.log();
  if (files.length === 0) {
    ux.log(chalk.dim(messages.getMessage('conflicts.none')));
  } else {
    ux.log(StandardColors.error(chalk.bold(messages.getMessage('conflicts.header', [files.length]))));
    ux.table<PreviewFile>(files, columns, { sort: 'path' });
  }
};

const printIgnoredTable = (files: PreviewFile[]): void => {
  ux.log();
  if (files.length === 0) {
    ux.log(chalk.dim(messages.getMessage('ignored.none')));
  } else {
    ux.log(chalk.dim(messages.getMessage('ignored.header', [files.length, 'change'])));
    ux.table<PreviewFile>(files, columns, { sort: 'path' });
  }
};

export const printTables = (retrieveResult: PreviewResult, deployResult: PreviewResult, concise = false): void => {
  printConflictsTable(retrieveResult.conflicts.concat(deployResult.conflicts));
  printRetrieveTable(retrieveResult.toRetrieve, retrieveResult.toDelete);
  printDeployTable(deployResult.toDeploy, deployResult.toDelete);

  if (!concise) {
    printIgnoredTable(retrieveResult.ignored);
  }
};

export const getConflictFiles = async (stl?: SourceTracking, ignore = false): Promise<Set<string>> =>
  !stl || ignore
    ? new Set<string>()
    : new Set((await stl.getConflicts()).flatMap((conflict) => (conflict.filenames ?? []).map((f) => resolve(f))));

// Need to put this function in an exportable class in order to stub it
export class Utils {
  public static async getComponents(
    project: SfProject | undefined,
    flags: KcDiffFlags,
    targetOrg: Org
  ): Promise<SourceTrackInformation> {
    const stl = await SourceTracking.create({
      org: targetOrg,
      project: project!,
    });

    const forceIgnore = ForceIgnore.findAndCreate(project!.getDefaultPackage().path);

    const [retrieveComponentSet, retrieveFilesWithConflicts, remoteDeletes] = await Promise.all([
      stl.remoteNonDeletesAsComponentSet(),
      getConflictFiles(stl, false),
      stl.getChanges({ origin: 'remote', state: 'delete', format: 'SourceComponent' }),
    ]);

    const [deployComponentSet, deployFilesWithConflicts] = await Promise.all([
      buildComponentSet({ ...flags, 'target-org': targetOrg.getUsername() }, stl),
      getConflictFiles(stl, false),
    ]);

    const retrieveOutput = compileResults({
      componentSet: retrieveComponentSet,
      projectPath: project!.getPath(),
      filesWithConflicts: retrieveFilesWithConflicts,
      forceIgnore,
      baseOperation: 'retrieve',
      remoteDeletes,
    });

    const deployOutput = compileResults({
      componentSet: deployComponentSet,
      projectPath: project!.getPath(),
      filesWithConflicts: deployFilesWithConflicts,
      forceIgnore,
      baseOperation: 'deploy',
    });

    return { retrieveOutput, deployOutput };
  }
}

// Formerly deploy.ts

export async function buildComponentSet(opts: Partial<DeployOptions>, stl?: SourceTracking): Promise<ComponentSet> {
  // if you specify nothing, you'll get the changes, like sfdx push, as long as there's an stl
  if (!opts['source-dir'] && !opts.manifest && !opts.metadata && stl) {
    /** localChangesAsComponentSet returned an array to support multiple sequential deploys.
     * `sf` chooses not to support this so we force one ComponentSet
     */
    const cs = (await stl.localChangesAsComponentSet(false))[0] ?? new ComponentSet(undefined, stl.registry);
    // stl produces a cs with api version already set.  command might have specified a version.
    if (opts['api-version']) {
      cs.apiVersion = opts['api-version'];
      cs.sourceApiVersion = opts['api-version'];
    }
    return cs;
  }

  return ComponentSetBuilder.build({
    apiversion: opts['api-version'],
    sourceapiversion: await getSourceApiVersion(),
    sourcepath: opts['source-dir'],
    ...(opts.manifest
      ? {
          manifest: {
            manifestPath: opts.manifest,
            directoryPaths: await getPackageDirs(),
          },
        }
      : {}),
    ...(opts.metadata ? { metadata: { metadataEntries: opts.metadata, directoryPaths: await getPackageDirs() } } : {}),
    projectDir: stl?.projectPath,
  });
}

// Formerly project.ts

export async function getPackageDirs(): Promise<string[]> {
  const project = await SfProject.resolve();
  return project.getUniquePackageDirectories().map((pDir) => pDir.fullPath);
}

export async function getSourceApiVersion(): Promise<Optional<string>> {
  const project = await SfProject.resolve();
  const projectConfig = await project.resolveProjectConfig();
  return projectConfig.sourceApiVersion as Optional<string>;
}

export async function getOptionalProject(): Promise<SfProject | undefined> {
  try {
    return await SfProject.resolve();
  } catch (e) {
    return undefined;
  }
}
