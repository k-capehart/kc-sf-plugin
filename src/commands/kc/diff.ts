import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org } from '@salesforce/core';
import { PreviewFile, PreviewResult, Utils, printTables } from '../../utils/previewOutput.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'kc.diff');

export type KcDiffResult = {
  ignored: PreviewFile[];
  conflicts: PreviewFile[];
  toDeploy: PreviewFile[];
  toDelete: PreviewFile[];
  toRetrieve: PreviewFile[];
};

export type SourceTrackInformation = {
  retrieveOutput: PreviewResult;
  deployOutput: PreviewResult;
};

export type KcDiffFlags = {
  'target-org': Org;
  concise: boolean;
  'flags-dir': string | undefined;
  json: boolean | undefined;
};

function combinePreviewResults(retrieveResults: PreviewResult, deployResults: PreviewResult): PreviewResult {
  const combinedResults: PreviewResult = {
    ignored: retrieveResults.ignored.concat(deployResults.ignored),
    conflicts: retrieveResults.conflicts.concat(deployResults.conflicts),
    toDeploy: retrieveResults.toDeploy.concat(deployResults.toDeploy),
    toDelete: retrieveResults.toDelete.concat(deployResults.toDelete),
    toRetrieve: retrieveResults.toRetrieve.concat(deployResults.toRetrieve),
  };
  return combinedResults;
}

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

    const sourceTrackInfo: SourceTrackInformation = await Promise.resolve(
      Utils.getComponents(this.project, flags, flags['target-org'])
    );

    if (!this.jsonEnabled()) {
      printTables(sourceTrackInfo.retrieveOutput, sourceTrackInfo.deployOutput, flags.concise);
    }
    return combinePreviewResults(sourceTrackInfo.retrieveOutput, sourceTrackInfo.deployOutput);
  }
}
