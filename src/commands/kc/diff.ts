import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { SourceTracking } from '@salesforce/source-tracking';
import { ForceIgnore } from '@salesforce/source-deploy-retrieve';
import { PreviewFile, compileResults, getConflictFiles, printTables } from '../../utils/previewOutput.js';
import { buildComponentSet } from '../../utils/deploy.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'kc.diff');

export type KcDiffResult = {
  ignored: PreviewFile[];
  conflicts: PreviewFile[];
  toDeploy: PreviewFile[];
  toDelete: PreviewFile[];
  toRetrieve: PreviewFile[];
};

export default class KcDiff extends SfCommand<KcDiffResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;

  public static readonly flags = {
    'target-org': Flags.requiredOrg({
      char: 'o',
      summary: messages.getMessage('flags.target-org.summary'),
      description: messages.getMessage('flags.target-org.description'),
      required: true,
    }),
    concise: Flags.boolean({
      summary: messages.getMessage('flags.concise.summary'),
      description: messages.getMessage('flags.concise.description'),
    }),
  };

  public async run(): Promise<KcDiffResult> {
    const { flags } = await this.parse(KcDiff);

    const stl = await SourceTracking.create({
      org: flags['target-org'],
      project: this.project!,
    });

    const forceIgnore = ForceIgnore.findAndCreate(this.project!.getDefaultPackage().path);

    const [retrieveComponentSet, retrieveFilesWithConflicts, remoteDeletes] = await Promise.all([
      stl.remoteNonDeletesAsComponentSet(),
      getConflictFiles(stl, false),
      stl.getChanges({ origin: 'remote', state: 'delete', format: 'SourceComponent' }),
    ]);

    const [deployComponentSet, deployFilesWithConflicts] = await Promise.all([
      buildComponentSet({ ...flags, 'target-org': flags['target-org'].getUsername() }, stl),
      getConflictFiles(stl, false),
    ]);

    const retrieveOutput = compileResults({
      componentSet: retrieveComponentSet,
      projectPath: this.project!.getPath(),
      filesWithConflicts: retrieveFilesWithConflicts,
      forceIgnore,
      baseOperation: 'retrieve',
      remoteDeletes,
    });

    const deployOutput = compileResults({
      componentSet: deployComponentSet,
      projectPath: this.project!.getPath(),
      filesWithConflicts: deployFilesWithConflicts,
      forceIgnore,
      baseOperation: 'deploy',
    });

    if (!this.jsonEnabled()) {
      printTables(retrieveOutput, deployOutput, flags.concise);
    }
    return retrieveOutput;
  }
}
