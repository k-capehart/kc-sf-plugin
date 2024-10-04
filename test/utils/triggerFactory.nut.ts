import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';
import { TestSession } from '@salesforce/cli-plugins-testkit';
import assert from 'yeoman-assert';
import { TemplateFiles } from '../../src/utils/types.js';
import { createFile } from '../../src/utils/triggerFactory.js';

describe('kc apex-factory trigger-framework trigger', () => {
  let session: TestSession;
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  const template1Dir = path.resolve(dirname, '../../src/templates/template-1/');

  before(async () => {
    session = await TestSession.create({
      project: {},
      devhubAuthStrategy: 'NONE',
    });
  });

  after(async () => {
    await session?.clean();
  });

  it('creates apex trigger to a path and replaces tokens', async () => {
    const targetDir: string = session.project.dir.concat('/force-app/main/default/triggers/');
    const tokens = new Map<string, string>([['{{sobject}}', 'Account']]);
    const result: string = createFile(
      TemplateFiles.SObjectTrigger,
      'AccountTrigger',
      '.trigger',
      targetDir,
      tokens,
      template1Dir
    );
    expect(result).to.equal(targetDir.concat('AccountTrigger.trigger'));
    assert.fileContent(path.join(targetDir, 'AccountTrigger.trigger'), 'trigger AccountTrigger on Account');
  });

  it('does not create apex trigger because it already exists', async () => {
    const targetDir: string = session.project.dir.concat('/force-app/main/default/triggers/');
    const result: string = createFile(
      TemplateFiles.SObjectTrigger,
      'AccountTrigger',
      '.trigger',
      targetDir,
      new Map<string, string>(),
      template1Dir
    );
    expect(result).to.equal('');
  });

  it('creates apex class handler to a path and replaces tokens', async () => {
    const targetDir: string = session.project.dir.concat('/force-app/main/default/classes/');
    const tokens = new Map<string, string>([['{{sobject}}', 'Account']]);
    const result: string = createFile(
      TemplateFiles.SObjectHandler,
      'AccountTriggerHandler',
      '.cls',
      targetDir,
      tokens,
      template1Dir
    );
    expect(result).to.equal(targetDir.concat('AccountTriggerHandler.cls'));
    assert.fileContent(
      path.join(targetDir, 'AccountTriggerHandler.cls'),
      'public with sharing class AccountTriggerHandler extends TriggerHandler'
    );
  });

  it('creates custom field to a path and replaces tokens', async () => {
    const targetDir: string = session.project.dir.concat('/force-app/main/default/objects/BypassAutomation__c/fields/');
    const tokens = new Map<string, string>([['{{sobject}}', 'Account']]);
    const result = createFile(
      TemplateFiles.BypassCustomField,
      'Account__c',
      '.field-meta.xml',
      targetDir,
      tokens,
      template1Dir
    );
    expect(result).to.equal(targetDir.concat('Account__c.field-meta.xml'));
    assert.file(path.join(targetDir, 'Account__c.field-meta.xml'));
    assert.fileContent(path.join(targetDir, 'Account__c.field-meta.xml'), 'Account__c');
  });

  it('does not create a custom field because it already exists', async () => {
    const targetDir = session.project.dir.concat('/force-app/main/default/objects/BypassAutomation__c/fields/');
    const tokens = new Map<string, string>([['{{sobject}}', 'Account']]);
    const result: string = createFile(
      TemplateFiles.BypassCustomField,
      'Account__c',
      '.field-meta.xml',
      targetDir,
      tokens,
      template1Dir
    );
    expect(result).to.equal('');
  });

  it('creates custom object to a path', async () => {
    const targetDir = session.project.dir.concat('/force-app/main/default/objects/');
    const result: string = createFile(
      TemplateFiles.BypassCustomObject,
      'BypassAutomation__c',
      '.object-meta.xml',
      targetDir,
      new Map<string, string>(),
      template1Dir
    );
    expect(result).to.equal(targetDir.concat('BypassAutomation__c.object-meta.xml'));
    assert.file(path.join(targetDir, 'BypassAutomation__c.object-meta.xml'));
  });

  it('does not create a custom object because it already exists', async () => {
    const targetDir = session.project.dir.concat('/force-app/main/default/objects/');
    const result = createFile(
      TemplateFiles.BypassCustomObject,
      'BypassAutomation__c',
      '.object-meta.xml',
      targetDir,
      new Map<string, string>(),
      template1Dir
    );
    expect(result).to.equal('');
  });
});
