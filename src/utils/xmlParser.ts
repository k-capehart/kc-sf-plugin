import * as fs from 'node:fs';
import path from 'node:path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { ux } from '@oclif/core';

type ApexClassXml = {
  ApexClass: {
    apiVersion: string;
  };
};

type ApexTriggerXml = {
  ApexTrigger: {
    apiVersion: string;
  };
};

type FlowXml = {
  Flow: {
    apiVersion: string;
  };
};

type XmlData = ApexClassXml | ApexTriggerXml | FlowXml;

const parserOptions = {
  ignoreAttributes: false,
  trimValues: false,
};

const builderOptions = {
  format: true,
  ignoreAttributes: false,
  suppressEmptyNode: false,
};

export const updateAPIVersion = (targetDir: string, version: string): number => {
  let files: string[];
  try {
    files = fs.readdirSync(targetDir);
  } catch (error: unknown) {
    ux.error('Error reading directory:', error as Error);
  }

  const parser = new XMLParser(parserOptions);
  const builder = new XMLBuilder(builderOptions);
  let updatedNumber = 0;

  try {
    for (const file of files) {
      if (path.extname(file) === '.xml') {
        const filePath = path.join(targetDir, file);
        const data = fs.readFileSync(filePath, 'utf-8');
        const component = parser.parse(data) as XmlData;
        let isUpdated = false;

        if ('ApexClass' in component) {
          if (parseFloat(component.ApexClass.apiVersion) < parseFloat(version)) {
            component.ApexClass.apiVersion = version;
            isUpdated = true;
          }
        } else if ('ApexTrigger' in component) {
          if (parseFloat(component.ApexTrigger.apiVersion) < parseFloat(version)) {
            ux.stdout(parseFloat(component.ApexTrigger.apiVersion).toString());
            component.ApexTrigger.apiVersion = version;
            isUpdated = true;
          }
        } else if ('Flow' in component) {
          if (parseFloat(component.Flow.apiVersion) < parseFloat(version)) {
            component.Flow.apiVersion = version;
            isUpdated = true;
          }
        }

        if (isUpdated) {
          const updatedXml = builder.build(component) as string;
          // remove blank lines
          const cleanedXml = updatedXml.replace(/\n\s*\n/g, '\n');
          fs.writeFileSync(filePath, cleanedXml);
          updatedNumber++;
        }
      }
    }
  } catch (error: unknown) {
    ux.error(error as Error);
  }

  return updatedNumber;
};
