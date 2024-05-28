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

  if (!fs.existsSync(targetDir.concat(outputFileName))) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }
    fs.copyFileSync(classTemplate, targetDir.concat(outputFileName));
    fs.writeFileSync(targetDir.concat(outputFileName).concat('-meta.xml'), classDefContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [outputFileName, targetDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [outputFileName, targetDir]));
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

  if (!fs.existsSync(targetDir.concat(outputFileName))) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }
    fs.writeFileSync(targetDir.concat(outputFileName), apexTemplateContent);
    fs.writeFileSync(targetDir.concat(outputFileName).concat('-meta.xml'), apexDefContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [outputFileName, targetDir]));
    return outputFileName;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [outputFileName, targetDir]));
  }
  return '';
};
