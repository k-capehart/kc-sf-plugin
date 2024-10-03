import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Messages } from '@salesforce/core';
import { Ux } from '@salesforce/sf-plugins-core';
import { JsonData, TemplateFiles, apiVersion } from './types.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const sharedTemplates = path.resolve(dirname, '../templates/shared/');
const ux = new Ux();
Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const apexFactoryMessages = Messages.loadMessages('kc-sf-plugin', 'apexFactory');

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

export const generateTemplate = (sfdxDir: string, templateDir: string, init: boolean, sobject?: string): string[] => {
  const createdFiles: string[] = [];

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
    if(details.fileType === undefined || details.targetDir === undefined || details.name === undefined) {
      ux.warn('Make sure to include all required fields in template: fileType, targetDir, name');
      return [''];
    }

    let fileName: string = details.name;
    for (const [key, val] of tokens) {
      fileName = fileName.replaceAll(key, val);
    }
    const targetDir: string = sfdxDir.concat(details.targetDir);
    const fileType: string = details.fileType;

    createdFiles.push(createFile(template, fileName, fileType, targetDir, tokens, templateDir));
  }

  return [''];
};

export const createFile = (
  template: string,
  fileName: string,
  fileType: string,
  targetDir: string,
  tokens: Map<string, string>,
  templateDir: string
): string => {
  const templatePath = path.resolve(templateDir, template);
  let templateContent = fs.readFileSync(templatePath, 'utf-8');
  for (const [key, val] of tokens) {
    templateContent = templateContent.replaceAll(key, val);
  }

  verifyDirectory(targetDir);
   // if the file type is an apex class or trigger, then create a definition file
  createApexDefinitionFile(fileType, fileName, targetDir);
  
  const outputDir = targetDir.concat(fileName).concat(fileType);
  if (!fs.existsSync(outputDir)) {
    fs.writeFileSync(outputDir, templateContent);
    ux.log(apexFactoryMessages.getMessage('file.created', [outputDir]));
    return outputDir;
  } else {
    ux.log(apexFactoryMessages.getMessage('file.exists', [outputDir]));
  }
  return '';
};

export const createApexDefinitionFile = (
  fileType: string,
  fileName: string,
  targetDir: string,
): void => {
  let apexDefTemplate: string;
  if(fileType === '.cls') {
    apexDefTemplate = path.resolve(sharedTemplates, TemplateFiles.ApexClassDefinition);
  } else if(fileType === '.trigger') {
    apexDefTemplate = path.resolve(sharedTemplates, TemplateFiles.ApexTriggerDefinition);
  } else {
    return;
  }

  const apexDefContent = fs.readFileSync(apexDefTemplate, 'utf-8').replaceAll('{{apiVersion}}', apiVersion);
  const outputDir = targetDir.concat(fileName).concat(fileType).concat('-meta.xml');
  if(!fs.existsSync(outputDir)) {
    fs.writeFileSync(outputDir, apexDefContent);
  }
}

const verifyDirectory = (directory: string): void => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};
