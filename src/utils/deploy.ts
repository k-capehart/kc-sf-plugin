import { Messages } from '@salesforce/core';
import { ComponentSet, ComponentSetBuilder } from '@salesforce/source-deploy-retrieve';
import { SourceTracking } from '@salesforce/source-tracking';
import { getPackageDirs, getSourceApiVersion } from './project.js';
import { API } from './types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);

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
