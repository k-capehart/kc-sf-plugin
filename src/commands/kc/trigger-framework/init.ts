import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { TemplateFiles } from '../../../utils/types.js';
import { copyApexClass, createCustomObject } from '../../../utils/apexFactory.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'kc.trigger-framework.init');

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
      char: 'd',
      default: 'force-app/main/default',
      exists: true,
    }),
  };

  public async run(): Promise<KcApexfactoryTriggerframeworkInitResult> {
    const { flags } = await this.parse(KcApexfactoryTriggerframeworkInit);
    const classesDir = flags['target-dir'].concat('/classes/');
    const objectDir = flags['target-dir'].concat('/objects/');
    const triggerHandlerFileName = 'TriggerHandler.cls';
    const triggerHandlerTestFileName = 'TriggerHandler_Test.cls';
    const customSettingObjectName = 'BypassAutomation__c';

    const createdFiles: string[] = [];
    createdFiles.push(copyApexClass(TemplateFiles.TriggerHandlerVirtualClass, triggerHandlerFileName, classesDir));
    createdFiles.push(
      copyApexClass(TemplateFiles.TriggerHandlerVirtualClassTest, triggerHandlerTestFileName, classesDir)
    );
    createdFiles.push(createCustomObject(TemplateFiles.BypassCustomObject, customSettingObjectName, objectDir));

    return { createdFiles };
  }
}
