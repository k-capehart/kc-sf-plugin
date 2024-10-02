import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { generateTemplates } from '../../utils/triggerFactory.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'kc.trigger-framework');

export type KcTriggerFrameworkResult = {
  createdFiles: string[];
};

export default class KcTriggerFramework extends SfCommand<KcTriggerFrameworkResult> {
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
      exactlyOne: ['init', 'sobject'],
    }),
    sobject: Flags.string({
      summary: messages.getMessage('flags.sobject.summary'),
      char: 's',
      multiple: true,
      exactlyOne: ['init', 'sobject'],
    }),
    template: Flags.option({
      summary: messages.getMessage('flags.template.summary'),
      char: 't',
      options: ['1', '2'] as const,
      exactlyOne: ['template', 'custom-template'],
    })(),
    'custom-template': Flags.directory({
      summary: messages.getMessage('flags.custom-template.summary'),
      exists: true,
      exactlyOne: ['template', 'custom-template'],
    }),
  };

  public async run(): Promise<KcTriggerFrameworkResult> {
    const { flags } = await this.parse(KcTriggerFramework);
    const targetDir = flags['target-dir'];
    const init = flags['init'];
    const sobjects = flags['sobject'];
    const template = flags['template'];
    let createdFiles: string[] = [];

    const customTemplateDir = flags['custom-template'];
    const defaultTemplateDir = '../../templates/';
    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);
    let templateDir: string;

    switch (template) {
      case undefined:
        if (customTemplateDir !== undefined) {
          createdFiles = generateTemplates(targetDir, customTemplateDir, init, sobjects);
        }
        break;
      case '1':
        templateDir = path.resolve(dirname, defaultTemplateDir.concat('template-1/'));
        createdFiles = generateTemplates(targetDir, templateDir, init, sobjects);
        break;
      case '2':
        templateDir = path.resolve(dirname, defaultTemplateDir.concat('template-2/'));
        createdFiles = generateTemplates(targetDir, templateDir, init, sobjects);
        break;

      default:
        break;
    }

    return { createdFiles };
  }
}
