import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import KcApexFactoryTriggerFrameworkTrigger from '../../../../../src/commands/kc/apex-factory/trigger-framework/trigger.js';

describe('kc apex-factory trigger-framework trigger', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs hello', async () => {
    await KcApexFactoryTriggerFrameworkTrigger.run([]);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello world');
  });

  it('runs hello with --json and no provided name', async () => {
    const result = await KcApexFactoryTriggerFrameworkTrigger.run([]);
    expect(result.path).to.equal(
      '/Users/kcapehart/Documents/VS_Code_Projects/personal/kc-sf-plugin/src/commands/kc/apex-factory/trigger-framework/trigger.ts'
    );
  });

  it('runs hello world --name Astro', async () => {
    await KcApexFactoryTriggerFrameworkTrigger.run(['--name', 'Astro']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello Astro');
  });
});
