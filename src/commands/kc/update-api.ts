import * as fs from 'node:fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { updateAPIVersion } from '../../utils/xmlParser.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'kc.update-api');

export type KcUpdateApiResult = {
  updatedNumber: number;
};

export default class KcUpdateApi extends SfCommand<KcUpdateApiResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-dir': Flags.directory({
      summary: messages.getMessage('flags.target-dir.summary'),
      char: 'd',
      exists: true,
      default: 'force-app/main/default',
    }),
    type: Flags.option({
      summary: messages.getMessage('flags.type.summary'),
      char: 't',
      required: true,
      multiple: true,
      options: ['classes', 'triggers', 'flows'] as string[],
    })(),
    'api-version': Flags.orgApiVersion({
      summary: messages.getMessage('flags.api-version.summary'),
      char: 'v',
      required: true,
    }),
  };

  public async run(): Promise<KcUpdateApiResult> {
    const { flags } = await this.parse(KcUpdateApi);
    let updatedNumber = 0;

    const targetDir = flags['target-dir'];
    if (!fs.existsSync(targetDir)) {
      this.warn(targetDir + ' does not exist');
      return {
        updatedNumber,
      };
    }

    const apiVersion = flags['api-version'];

    // multiple types can be specified, so loop through all of them
    flags['type'].forEach((type) => {
      const componentDir = targetDir.concat('/' + type.toString());
      if (!fs.existsSync(componentDir)) {
        this.warn(componentDir + ' does not exist');
        return {
          updatedNumber,
        };
      }
      updatedNumber = updatedNumber + updateAPIVersion(componentDir, apiVersion);
    });

    return {
      updatedNumber,
    };
  }
}
