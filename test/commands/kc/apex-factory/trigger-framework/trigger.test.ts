import path from 'node:path';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';
import assert from 'yeoman-assert';

describe('kc apex-factory trigger-framework trigger', () => {
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

  it('runs kc apex-factory trigger-framework trigger', async () => {
    execCmd('kc:apex-factory:trigger-framework:trigger --sobject Account');
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
  });
});
