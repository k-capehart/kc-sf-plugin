import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import KcApexFactoryTriggerFrameworkInit from '../../../../../src/commands/kc/apex-factory/trigger-framework/init.js';

describe('kc apex-factory trigger-framework init', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs hello', async () => {
    await KcApexFactoryTriggerFrameworkInit.run([]);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello world');
  });

  it('runs hello with --json and no provided name', async () => {
    const result = await KcApexFactoryTriggerFrameworkInit.run([]);
    expect(result.path).to.equal(
      '/Users/kcapehart/Documents/VS_Code_Projects/personal/kc-sf-plugin/src/commands/kc/apex-factory/trigger-framework/init.ts'
    );
  });

  it('runs hello world --name Astro', async () => {
    await KcApexFactoryTriggerFrameworkInit.run(['--name', 'Astro']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello Astro');
  });
});
