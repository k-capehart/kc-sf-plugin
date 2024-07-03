import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Messages } from '@salesforce/core';
import { Ux } from '@salesforce/sf-plugins-core';
import { ApexFileType, JsonData, TemplateFiles, apiVersion } from './types.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const sharedTemplates = path.resolve(dirname, '../templates/shared/');
const ux = new Ux();
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const apexFactoryMessages = Messages.loadMessages('kc-sf-plugin', 'apexFactory');

export const generateTemplate = (targetDir: string, templateDir: string, init: boolean, sobject?: string): string[] => {
  const createdFiles: string[] = [];
  const classesDir = targetDir.concat('/classes/');
  const triggersDir = targetDir.concat('/triggers/');
  const customObjectDir = targetDir.concat('/objects/');

  let instructions: string;
  const tokens = new Map<string, string>();
  if (sobject !== undefined) {
    tokens.set('{{sobject}}', sobject);
    instructions = path.resolve(templateDir, 'sobject.json');
  } else {
    instructions = path.resolve(templateDir, 'init.json');
  }
  const data = fs.readFileSync(instructions, 'utf-8');
  const jsonData = JSON.parse(data) as JsonData;

  for (const [template, details] of Object.entries(jsonData)) {
    let fileName: string = details.name;
    for (const [key, val] of tokens) {
      fileName = fileName.replaceAll(key, val);
    }

    switch (details.type) {
      case 'class':
        createdFiles.push(createApexFile(template, fileName, classesDir, details.type, tokens, templateDir));
        break;
      case 'trigger':
        createdFiles.push(createApexFile(template, fileName, triggersDir, details.type, tokens, templateDir));
        break;
      case 'object':
        createdFiles.push(createCustomObject(template, fileName, customObjectDir, tokens, templateDir));
        break;
      case 'field':
        createdFiles.push(createField(template, fileName, details.object, customObjectDir, tokens, templateDir));
        break;
      default:
        break;
    }
  }

  return [''];
};

export const generateTemplates = (
  targetDir: string,
  templateDir: string,
  init: boolean,
  sobjects?: string[]
): string[] => {
  const createdFiles: string[] = [];

  if (sobjects !== undefined) {
    sobjects.forEach((sobject) => {
      createdFiles.push(...generateTemplate(targetDir, templateDir, init, sobject));
    });
  } else if (init) {
    createdFiles.push(...generateTemplate(targetDir, templateDir, init));
  }

  return createdFiles;
};

export const createApexFile = (
  template: string,
  name: string,
  targetDir: string,
  type: ApexFileType,
  tokens: Map<string, string>,
  templateDir: string
): string => {
  const apexTemplate = path.resolve(templateDir, template);
  let apexDefTemplate: string;
  let outputFileName: string;

  if (type === 'class') {
    apexDefTemplate = path.resolve(sharedTemplates, TemplateFiles.ApexClassDefinition);
    outputFileName = name.concat('.cls');
  } else {
    apexDefTemplate = path.resolve(sharedTemplates, TemplateFiles.ApexTriggerDefinition);
    outputFileName = name.concat('.trigger');
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
  tokens: Map<string, string>,
  templateDir: string
): string => {
  const outputFileName = objectName.concat('.object-meta.xml');
  const objectTemplate = path.resolve(templateDir, template);
  let objectTemplateContent = fs.readFileSync(objectTemplate, 'utf-8');
  for (const [key, val] of tokens) {
    objectTemplateContent = objectTemplateContent.replaceAll(key, val);
  }

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
  fieldName: string,
  object: string,
  targetDir: string,
  tokens: Map<string, string>,
  templateDir: string
): string => {
  const outputFileName = fieldName.concat('.field-meta.xml');
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
