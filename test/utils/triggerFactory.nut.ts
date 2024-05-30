import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';
import { TestSession } from '@salesforce/cli-plugins-testkit';
import assert from 'yeoman-assert';
import { TemplateFiles } from '../../src/utils/types.js';
import { createApexFile, createCustomObject, createField } from '../../src/utils/triggerFactory.js';

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
    const triggerDir = session.project.dir.concat('/force-app/main/default/triggers/');
    const tokens = new Map<string, string>([['{{sobject}}', 'Account']]);
    const result = createApexFile(
      TemplateFiles.SObjectTrigger,
      'AccountTrigger',
      triggerDir,
      'trigger',
      tokens,
      template1Dir
    );
    expect(result).to.equal('AccountTrigger.trigger');
    assert.fileContent(path.join(triggerDir, 'AccountTrigger.trigger'), 'trigger AccountTrigger on Account');
  });

  it('does not create apex trigger because it already exists', async () => {
    const triggerDir = session.project.dir.concat('/force-app/main/default/triggers/');
    const result = createApexFile(
      TemplateFiles.SObjectTrigger,
      'AccountTrigger',
      triggerDir,
      'trigger',
      new Map<string, string>(),
      template1Dir
    );
    expect(result).to.equal('');
  });

  it('creates apex class handler to a path and replaces tokens', async () => {
    const classesDir = session.project.dir.concat('/force-app/main/default/classes/');
    const tokens = new Map<string, string>([['{{sobject}}', 'Account']]);
    const result = createApexFile(
      TemplateFiles.SObjectHandler,
      'AccountTriggerHandler',
      classesDir,
      'class',
      tokens,
      template1Dir
    );
    expect(result).to.equal('AccountTriggerHandler.cls');
    assert.fileContent(
      path.join(classesDir, 'AccountTriggerHandler.cls'),
      'public with sharing class AccountTriggerHandler extends TriggerHandler'
    );
  });

  it('creates custom field to a path and replaces tokens', async () => {
    const objectsDir = session.project.dir.concat('/force-app/main/default/objects/');
    const tokens = new Map<string, string>([['{{sobject}}', 'Account']]);
    const result = createField(
      TemplateFiles.BypassCustomField,
      'Account__c',
      'BypassAutomation__c',
      objectsDir,
      tokens,
      template1Dir
    );
    expect(result).to.equal('Account__c.field-meta.xml');
    assert.file(path.join(objectsDir.concat('/BypassAutomation__c/fields/Account__c.field-meta.xml')));
    assert.fileContent(
      path.join(objectsDir.concat('/BypassAutomation__c/fields/', 'Account__c.field-meta.xml')),
      'Account__c'
    );
  });

  it('does not create a custom field because it already exists', async () => {
    const objectsDir = session.project.dir.concat('/force-app/main/default/objects/');
    const tokens = new Map<string, string>([['{{sobject}}', 'Account']]);
    const result = createField(
      TemplateFiles.BypassCustomField,
      'Account__c',
      'BypassAutomation__c',
      objectsDir,
      tokens,
      template1Dir
    );
    expect(result).to.equal('');
  });

  it('creates custom object to a path', async () => {
    const objectsDir = session.project.dir.concat('/force-app/main/default/objects/');
    const result = createCustomObject(
      TemplateFiles.BypassCustomObject,
      'BypassAutomation__c',
      objectsDir,
      new Map<string, string>(),
      template1Dir
    );
    expect(result).to.equal('BypassAutomation__c.object-meta.xml');
    assert.file(path.join(objectsDir.concat('/BypassAutomation__c/BypassAutomation__c.object-meta.xml')));
  });

  it('does not create a custom object because it already exists', async () => {
    const objectsDir = session.project.dir.concat('/force-app/main/default/objects/');
    const result = createCustomObject(
      TemplateFiles.BypassCustomObject,
      'BypassAutomation__c',
      objectsDir,
      new Map<string, string>(),
      template1Dir
    );
    expect(result).to.equal('');
  });
});
