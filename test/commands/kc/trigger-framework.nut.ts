import path from 'node:path';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';
import assert from 'yeoman-assert';

describe('kc apex-factory trigger-framework trigger network tests', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: {},
      devhubAuthStrategy: 'NONE',
    });
  });

  after(async () => {
    await session?.clean();
  });

  it('runs kc apex-factory trigger-framework with init', async () => {
    execCmd('kc:trigger-framework --template 1 --init');
    assert.file(
      [
        'TriggerHandler.cls',
        'TriggerHandler.cls-meta.xml',
        'TriggerHandler_Test.cls',
        'TriggerHandler_Test.cls-meta.xml',
      ].map((f) => path.join(session.project.dir.concat('/force-app/main/default/classes'), f))
    );
    assert.file(
      ['BypassAutomation__c.object-meta.xml'].map((f) =>
        path.join(session.project.dir.concat('/force-app/main/default/objects'), f)
      )
    );
  });

  it('runs kc apex-factory trigger-framework with sobject', async () => {
    execCmd('kc:trigger-framework --template 1 --sobject Account');
    assert.file(
      ['AccountTrigger.trigger', 'AccountTrigger.trigger-meta.xml'].map((f) =>
        path.join(session.project.dir.concat('/force-app/main/default/triggers'), f)
      )
    );
    assert.file(
      [
        'AccountTriggerHandler.cls',
        'AccountTriggerHandler.cls-meta.xml',
        'AccountHelper.cls',
        'AccountHelper.cls-meta.xml',
        'AccountHelper_Test.cls',
        'AccountHelper_Test.cls-meta.xml',
      ].map((f) => path.join(session.project.dir.concat('/force-app/main/default/classes'), f))
    );
    assert.file(
      path.join(
        session.project.dir.concat(
          '/force-app/main/default/objects/BypassAutomation__c/fields/Account__c.field-meta.xml'
        )
      )
    );
  });

  it('runs kc apex-factory trigger-framework with 2 sobjects', async () => {
    execCmd('kc:trigger-framework --template 1 --sobject Lead --sobject Contact');
    assert.file(
      [
        'LeadTrigger.trigger',
        'LeadTrigger.trigger-meta.xml',
        'ContactTrigger.trigger',
        'ContactTrigger.trigger-meta.xml',
      ].map((f) => path.join(session.project.dir.concat('/force-app/main/default/triggers'), f))
    );
    assert.file(
      [
        'LeadTriggerHandler.cls',
        'LeadTriggerHandler.cls-meta.xml',
        'LeadHelper.cls',
        'LeadHelper.cls-meta.xml',
        'LeadHelper_Test.cls',
        'LeadHelper_Test.cls-meta.xml',
        'ContactTriggerHandler.cls',
        'ContactTriggerHandler.cls-meta.xml',
        'ContactHelper.cls',
        'ContactHelper.cls-meta.xml',
        'ContactHelper_Test.cls',
        'ContactHelper_Test.cls-meta.xml',
      ].map((f) => path.join(session.project.dir.concat('/force-app/main/default/classes'), f))
    );
    assert.file(
      ['Lead__c.field-meta.xml', 'Contact__c.field-meta.xml'].map((f) =>
        path.join(session.project.dir.concat('/force-app/main/default/objects/BypassAutomation__c/fields'), f)
      )
    );
  });
});
