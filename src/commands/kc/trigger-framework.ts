import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { generateTemplate1, initializeTemplate1 } from '../../utils/triggerFactory.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'kc.trigger-framework');

export type KcApexFactoryTriggerFrameworkResult = {
  createdFiles: string[];
};

export default class KcApexFactoryTriggerFramework extends SfCommand<KcApexFactoryTriggerFrameworkResult> {
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
    init: Flags.boolean({
      summary: messages.getMessage('flags.init.summary'),
      char: 'i',
      exactlyOne: ['sobject', 'init'],
    }),
    sobject: Flags.string({
      summary: messages.getMessage('flags.sobject.summary'),
      char: 's',
      multiple: true,
      exactlyOne: ['sobject', 'init'],
    }),
    template: Flags.option({
      summary: messages.getMessage('flags.template.summary'),
      char: 't',
      required: true,
      options: ['1'] as const,
      default: '1',
    })(),
    'template-override': Flags.directory({
      summary: messages.getMessage('flags.template-override.summary'),
      exists: true,
    }),
  };

  public async run(): Promise<KcApexFactoryTriggerFrameworkResult> {
    const { flags } = await this.parse(KcApexFactoryTriggerFramework);
    const targetDir = flags['target-dir'];
    const init = flags['init'];
    const sobjects = flags['sobject'];
    const template = flags['template'];
    let templateDir = flags['template-override'];
    let createdFiles: string[] = [];

    const defaultTemplateDir = '../../templates/';
    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);

    switch (template) {
      case '1':
        if (templateDir === undefined) {
          templateDir = path.resolve(dirname, defaultTemplateDir.concat('template-1/'));
        }
        if (init) {
          createdFiles = initializeTemplate1(targetDir, templateDir);
        } else if (sobjects !== undefined) {
          createdFiles = generateTemplate1(sobjects, targetDir, templateDir);
        }
        break;

      default:
        break;
    }

    return { createdFiles };
  }
}
