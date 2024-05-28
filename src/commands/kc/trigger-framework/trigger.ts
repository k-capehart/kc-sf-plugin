import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { createApexFile, createField } from '../../../utils/apexFactory.js';
import { TemplateFiles } from '../../../utils/types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'kc.trigger-framework.trigger');

export type KcApexFactoryTriggerFrameworkTriggerResult = {
  createdFiles: string[];
};

export default class KcApexFactoryTriggerFrameworkTrigger extends SfCommand<KcApexFactoryTriggerFrameworkTriggerResult> {
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
    sobject: Flags.string({
      summary: messages.getMessage('flags.sobject.summary'),
      char: 's',
      required: true,
      multiple: true,
    }),
  };

  public async run(): Promise<KcApexFactoryTriggerFrameworkTriggerResult> {
    const { flags } = await this.parse(KcApexFactoryTriggerFrameworkTrigger);
    const classesDir = flags['target-dir'].concat('/classes/');
    const triggerDir = flags['target-dir'].concat('/triggers/');
    const customFieldDir = flags['target-dir'].concat('/objects/');
    const sobjectNames = flags['sobject'];
    const customSettingName = 'BypassAutomation__c';

    const createdFiles: string[] = [];
    sobjectNames.forEach((sobject) => {
      const tokens = new Map<string, string>([['{{sobject}}', sobject]]);

      const triggerName = sobject.concat('Trigger.trigger');
      createdFiles.push(createApexFile(TemplateFiles.SObjectTrigger, triggerName, triggerDir, 'trigger', tokens));

      const handlerName = sobject.concat('TriggerHandler.cls');
      createdFiles.push(createApexFile(TemplateFiles.SObjectHandler, handlerName, classesDir, 'class', tokens));

      const helperName = sobject.concat('Helper.cls');
      createdFiles.push(createApexFile(TemplateFiles.SObjectHelper, helperName, classesDir, 'class', tokens));

      const helperTestName = sobject.concat('Helper_Test.cls');
      createdFiles.push(createApexFile(TemplateFiles.SObjectHelperTest, helperTestName, classesDir, 'class', tokens));

      const bypassFieldName = sobject.concat('__c.field-meta.xml');
      createdFiles.push(
        createField(TemplateFiles.BypassCustomField, bypassFieldName, customSettingName, customFieldDir, tokens)
      );
    });

    return { createdFiles };
  }
}
