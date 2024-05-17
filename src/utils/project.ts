import { SfProject } from '@salesforce/core';
import { Optional } from '@salesforce/ts-types';

export async function getPackageDirs(): Promise<string[]> {
  const project = await SfProject.resolve();
  return project.getUniquePackageDirectories().map((pDir) => pDir.fullPath);
}

export async function getSourceApiVersion(): Promise<Optional<string>> {
  const project = await SfProject.resolve();
  const projectConfig = await project.resolveProjectConfig();
  return projectConfig.sourceApiVersion as Optional<string>;
}

export async function getOptionalProject(): Promise<SfProject | undefined> {
  try {
    return await SfProject.resolve();
  } catch (e) {
    return undefined;
  }
}
