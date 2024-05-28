import path from 'node:path';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';
import assert from 'yeoman-assert';
describe('kc apex-factory trigger-framework init', () => {
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

  it('runs kc apex-factory trigger-framework init', async () => {
    execCmd('kc:apex-factory:trigger-framework:init');
    assert.file(
      [
        'TriggerHandler.cls',
        'TriggerHandler.cls-meta.xml',
        'TriggerHandler_Test.cls',
        'TriggerHandler_Test.cls-meta.xml',
      ].map((f) => path.join(session.project.dir.concat('/force-app/main/default/classes'), f))
    );
  });
});
