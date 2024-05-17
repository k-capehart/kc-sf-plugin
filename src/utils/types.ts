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

export type PathInfo = {
  type: 'directory' | 'file';
  path: string;
};

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
