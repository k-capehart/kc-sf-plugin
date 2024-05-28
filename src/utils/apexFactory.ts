import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { ApexFileType, TemplateFiles, apiVersion } from './types.js';

const templateDir = '../templates/';
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const apexFactoryMessages = Messages.loadMessages('kc-sf-plugin', 'apexFactory');

export const copyApexClass = (template: string, outputFileName: string, targetDir: string): string => {
  const classTemplate = path.resolve(dirname, templateDir.concat(template));
  const classDefTemplate = path.resolve(dirname, templateDir.concat(TemplateFiles.ApexClassDefinition));
  const classDefContent = fs.readFileSync(classDefTemplate, 'utf-8').replaceAll('{{apiVersion}}', apiVersion);

  verifyDirectory(targetDir);
  targetDir = targetDir.concat(outputFileName);
  if (!fs.existsSync(targetDir)) {
    fs.copyFileSync(classTemplate, targetDir);
    fs.writeFileSync(targetDir.concat('-meta.xml'), classDefContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [targetDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [targetDir]));
  }
  return '';
};

export const createApexFile = (
  template: string,
  outputFileName: string,
  targetDir: string,
  type: ApexFileType,
  tokens: Map<string, string>
): string => {
  const apexTemplate = path.resolve(dirname, templateDir.concat(template));
  let apexDefTemplate: string;
  if (type === 'class') {
    apexDefTemplate = path.resolve(dirname, templateDir.concat(TemplateFiles.ApexClassDefinition));
  } else {
    apexDefTemplate = path.resolve(dirname, templateDir.concat(TemplateFiles.ApexTriggerDefinition));
  }
  const apexDefContent = fs.readFileSync(apexDefTemplate, 'utf-8').replaceAll('{{apiVersion}}', apiVersion);
  let apexTemplateContent = fs.readFileSync(apexTemplate, 'utf-8');
  for (const [key, val] of tokens) {
    apexTemplateContent = apexTemplateContent.replaceAll(key, val);
  }

  verifyDirectory(targetDir);
  targetDir = targetDir.concat(outputFileName);
  if (!fs.existsSync(targetDir)) {
    fs.writeFileSync(targetDir, apexTemplateContent);
    fs.writeFileSync(targetDir.concat('-meta.xml'), apexDefContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [targetDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [targetDir]));
  }
  return '';
};

export const createCustomObject = (template: string, objectName: string, targetDir: string): string => {
  const objectTemplate = path.resolve(dirname, templateDir.concat(template));
  const objectTemplateContent = fs.readFileSync(objectTemplate, 'utf-8');
  const outputFileName = objectName.concat('.object-meta.xml');

  targetDir = targetDir.concat('/' + objectName + '/');
  verifyDirectory(targetDir);
  targetDir = targetDir.concat(outputFileName);
  if (!fs.existsSync(targetDir)) {
    fs.writeFileSync(targetDir, objectTemplateContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [targetDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [targetDir]));
  }
  return '';
};

export const createField = (
  template: string,
  outputFileName: string,
  object: string,
  targetDir: string,
  tokens: Map<string, string>
): string => {
  const fieldTemplate = path.resolve(dirname, templateDir.concat(template));
  let fieldTemplateContent = fs.readFileSync(fieldTemplate, 'utf-8');
  for (const [key, val] of tokens) {
    fieldTemplateContent = fieldTemplateContent.replaceAll(key, val);
  }

  targetDir = targetDir.concat(object).concat('/fields/');
  verifyDirectory(targetDir);
  targetDir = targetDir.concat(outputFileName);
  if (!fs.existsSync(targetDir)) {
    fs.writeFileSync(targetDir, fieldTemplateContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [targetDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [targetDir]));
  }
  return '';
};

const verifyDirectory = (directory: string): void => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};
