import { SourceComponent, ComponentLike } from '@salesforce/source-deploy-retrieve';
import { isObject } from '@salesforce/ts-types';

export enum TestLevel {
  NoTestRun = 'NoTestRun',
  RunSpecifiedTests = 'RunSpecifiedTests',
  RunLocalTests = 'RunLocalTests',
  RunAllTestsInOrg = 'RunAllTestsInOrg',
}

export enum API {
  SOAP = 'SOAP',
  REST = 'REST',
}

export enum TemplateFiles {
  ApexClassDefinition = 'ApexClassDefinition.txt',
  ApexTriggerDefinition = 'ApexTriggerDefinition.txt',
  SObjectTrigger = 'SObjectTrigger.txt',
  SObjectHandler = 'SObjectTriggerHandler.txt',
  SObjectHelper = 'SObjectTriggerHelper.txt',
  SObjectHelperTest = 'SObjectTriggerHelper_Test.txt',
  TriggerHandlerVirtualClass = 'TriggerHandlerVirtualClass.txt',
  TriggerHandlerVirtualClassTest = 'TriggerHandlerVirtualClass_Test.txt',
  BypassCustomObject = 'BypassCustomObject.txt',
  BypassCustomField = 'BypassCustomField.txt',
}

export type PathInfo = {
  type: 'directory' | 'file';
  path: string;
};

export type ApexFileType = 'class' | 'trigger';

export const apiVersion: string = '60.0';

/** validates source component with fullname, type, and xml props */
export const isSourceComponent = (sc: ComponentLike): sc is SourceComponent =>
  isObject(sc) &&
  'type' in sc &&
  typeof sc.type === 'object' &&
  sc.type !== null &&
  'name' in sc.type &&
  typeof sc.type.name === 'string' &&
  'fullName' in sc &&
  'walkContent' in sc &&
  typeof sc.fullName === 'string';

export const isSourceComponentWithXml = (sc: ComponentLike): sc is SourceComponent & { xml: string } =>
  isSourceComponent(sc) && 'xml' in sc && typeof sc.xml === 'string';
