import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { ApexFileType, TemplateFiles, apiVersion } from './types.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const sharedTemplates = path.resolve(dirname, '../templates/shared/');
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const apexFactoryMessages = Messages.loadMessages('kc-sf-plugin', 'apexFactory');

export const initializeTemplate1 = (targetDir: string, templateDir: string): string[] => {
  const createdFiles: string[] = [];
  const classesDir = targetDir.concat('/classes/');
  const customObjectDir = targetDir.concat('/objects/');
  const customSettingName = 'BypassAutomation__c';

  const triggerHandlerFileName = 'TriggerHandler.cls';
  createdFiles.push(
    copyApexClass(TemplateFiles.TriggerHandlerVirtualClass, triggerHandlerFileName, classesDir, templateDir)
  );

  const triggerHandlerTestFileName = 'TriggerHandler_Test.cls';
  createdFiles.push(
    copyApexClass(TemplateFiles.TriggerHandlerVirtualClassTest, triggerHandlerTestFileName, classesDir, templateDir)
  );

  createdFiles.push(
    createCustomObject(TemplateFiles.BypassCustomObject, customSettingName, customObjectDir, templateDir)
  );

  return createdFiles;
};

export const generateTemplate1 = (sobjects: string[], targetDir: string, templateDir: string): string[] => {
  const createdFiles: string[] = [];
  const classesDir = targetDir.concat('/classes/');
  const triggerDir = targetDir.concat('/triggers/');
  const customObjectDir = targetDir.concat('/objects/');
  const customSettingName = 'BypassAutomation__c';

  sobjects.forEach((sobject) => {
    const tokens = new Map<string, string>([['{{sobject}}', sobject]]);

    const triggerName = sobject.concat('Trigger.trigger');
    createdFiles.push(
      createApexFile(TemplateFiles.SObjectTrigger, triggerName, triggerDir, 'trigger', tokens, templateDir)
    );

    const handlerName = sobject.concat('TriggerHandler.cls');
    createdFiles.push(
      createApexFile(TemplateFiles.SObjectHandler, handlerName, classesDir, 'class', tokens, templateDir)
    );

    const helperName = sobject.concat('Helper.cls');
    createdFiles.push(
      createApexFile(TemplateFiles.SObjectHelper, helperName, classesDir, 'class', tokens, templateDir)
    );

    const helperTestName = sobject.concat('Helper_Test.cls');
    createdFiles.push(
      createApexFile(TemplateFiles.SObjectHelperTest, helperTestName, classesDir, 'class', tokens, templateDir)
    );

    const bypassFieldName = sobject.concat('__c.field-meta.xml');
    createdFiles.push(
      createField(
        TemplateFiles.BypassCustomField,
        bypassFieldName,
        customSettingName,
        customObjectDir,
        tokens,
        templateDir
      )
    );
  });

  return createdFiles;
};

export const copyApexClass = (
  template: string,
  outputFileName: string,
  targetDir: string,
  templateDir: string
): string => {
  const classTemplate = path.resolve(templateDir, template);
  const classDefTemplate = path.resolve(sharedTemplates, TemplateFiles.ApexClassDefinition);
  const classDefContent = fs.readFileSync(classDefTemplate, 'utf-8').replaceAll('{{apiVersion}}', apiVersion);

  verifyDirectory(targetDir);
  const outputDir = targetDir.concat(outputFileName);
  if (!fs.existsSync(outputDir)) {
    fs.copyFileSync(classTemplate, outputDir);
    fs.writeFileSync(outputDir.concat('-meta.xml'), classDefContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [outputDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [outputDir]));
  }
  return '';
};

export const createApexFile = (
  template: string,
  outputFileName: string,
  targetDir: string,
  type: ApexFileType,
  tokens: Map<string, string>,
  templateDir: string
): string => {
  const apexTemplate = path.resolve(templateDir, template);
  let apexDefTemplate: string;

  if (type === 'class') {
    apexDefTemplate = path.resolve(sharedTemplates, TemplateFiles.ApexClassDefinition);
  } else {
    apexDefTemplate = path.resolve(sharedTemplates, TemplateFiles.ApexTriggerDefinition);
  }
  const apexDefContent = fs.readFileSync(apexDefTemplate, 'utf-8').replaceAll('{{apiVersion}}', apiVersion);
  let apexTemplateContent = fs.readFileSync(apexTemplate, 'utf-8');
  for (const [key, val] of tokens) {
    apexTemplateContent = apexTemplateContent.replaceAll(key, val);
  }

  verifyDirectory(targetDir);
  const outputDir = targetDir.concat(outputFileName);
  if (!fs.existsSync(outputDir)) {
    fs.writeFileSync(outputDir, apexTemplateContent);
    fs.writeFileSync(outputDir.concat('-meta.xml'), apexDefContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [outputDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [outputDir]));
  }
  return '';
};

export const createCustomObject = (
  template: string,
  objectName: string,
  targetDir: string,
  templateDir: string
): string => {
  const objectTemplate = path.resolve(templateDir, template);
  const objectTemplateContent = fs.readFileSync(objectTemplate, 'utf-8');
  const outputFileName = objectName.concat('.object-meta.xml');

  let outputDir = targetDir.concat(objectName);
  verifyDirectory(outputDir);
  outputDir = outputDir.concat('/' + outputFileName);
  if (!fs.existsSync(outputDir)) {
    fs.writeFileSync(outputDir, objectTemplateContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [outputDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [outputDir]));
  }
  return '';
};

export const createField = (
  template: string,
  outputFileName: string,
  object: string,
  targetDir: string,
  tokens: Map<string, string>,
  templateDir: string
): string => {
  const fieldTemplate = path.resolve(templateDir, template);
  let fieldTemplateContent = fs.readFileSync(fieldTemplate, 'utf-8');
  for (const [key, val] of tokens) {
    fieldTemplateContent = fieldTemplateContent.replaceAll(key, val);
  }

  let outputDir = targetDir.concat(object).concat('/fields/');
  verifyDirectory(outputDir);
  outputDir = outputDir.concat(outputFileName);
  if (!fs.existsSync(outputDir)) {
    fs.writeFileSync(outputDir, fieldTemplateContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [outputDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [outputDir]));
  }
  return '';
};

const verifyDirectory = (directory: string): void => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};
