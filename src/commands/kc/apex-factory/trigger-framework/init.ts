import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { TemplateFiles } from '../../../../utils/types.js';
import { copyApexClass } from '../../../../utils/apexFactory.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'kc.apex-factory.trigger-framework.init');

export type KcApexfactoryTriggerframeworkInitResult = {
  createdFiles: string[];
};

export default class KcApexfactoryTriggerframeworkInit extends SfCommand<KcApexfactoryTriggerframeworkInitResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-dir': Flags.directory({
      summary: messages.getMessage('flags.target-dir.summary'),
      char: 't',
      default: 'force-app/main/default',
      exists: true,
    }),
    'class-name': Flags.string({
      summary: messages.getMessage('flags.class-name.summary'),
      char: 'n',
      default: 'TriggerHandler',
    }),
  };

  public async run(): Promise<KcApexfactoryTriggerframeworkInitResult> {
    const { flags } = await this.parse(KcApexfactoryTriggerframeworkInit);
    const classesDir = flags['target-dir'].concat('/classes/');
    const triggerHandlerFileName = flags['class-name'].concat('.cls');
    const triggerHandlerTestFileName = flags['class-name'].concat('_Test.cls');

    const result: KcApexfactoryTriggerframeworkInitResult = {
      createdFiles: [],
    };

    copyApexClass(TemplateFiles.TriggerHandlerVirtualClass, triggerHandlerFileName, classesDir);
    copyApexClass(TemplateFiles.TriggerHandlerVirtualClassTest, triggerHandlerTestFileName, classesDir);

    return result;
  }
}
