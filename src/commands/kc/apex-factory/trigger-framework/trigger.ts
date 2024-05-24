import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { createApexFile } from '../../../../utils/apexFactory.js';
import { TemplateFiles } from '../../../../utils/types.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('kc-sf-plugin', 'kc.apex-factory.trigger-framework.trigger');

export type KcApexFactoryTriggerFrameworkTriggerResult = {
  path: string;
};

export default class KcApexFactoryTriggerFrameworkTrigger extends SfCommand<KcApexFactoryTriggerFrameworkTriggerResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'target-dir': Flags.directory({
      summary: messages.getMessage('flags.target-dir.summary'),
      char: 't',
      exists: true,
      default: 'force-app/main/default',
    }),
    'handler-name': Flags.string({
      summary: messages.getMessage('flags.handler-name.summary'),
      default: 'TriggerHandler',
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
    const sobjectNames = flags['sobject'];

    sobjectNames.forEach((sobject) => {
      const triggerName = sobject.concat('Trigger.trigger');
      const triggerTokens = new Map<string, string>([['{{sobject}}', sobject]]);
      createApexFile(TemplateFiles.SObjectTrigger, triggerName, triggerDir, 'trigger', triggerTokens);
      const handlerName = sobject.concat('TriggerHandler.cls');
      const handlerTokens = new Map<string, string>([
        ['{{sobject}}', sobject],
        ['{{handler}}', flags['handler-name']],
      ]);
      createApexFile(TemplateFiles.SObjectHandler, handlerName, classesDir, 'class', handlerTokens);
      const helperName = sobject.concat('Helper.cls');
      const helperTokens = new Map<string, string>([['{{sobject}}', sobject]]);
      createApexFile(TemplateFiles.SObjectHelper, helperName, classesDir, 'class', helperTokens);
      const helperTestName = sobject.concat('Helper_Test.cls');
      const helperTestTokens = new Map<string, string>([['{{sobject}}', sobject]]);
      createApexFile(TemplateFiles.SObjectHelperTest, helperTestName, classesDir, 'class', helperTestTokens);
    });

    return {
      path: '/Users/kcapehart/Documents/VS_Code_Projects/personal/kc-sf-plugin/src/commands/kc/apex-factory/trigger-framework/trigger.ts',
    };
  }
}
