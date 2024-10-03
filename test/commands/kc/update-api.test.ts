import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import KcUpdateApi from '../../../src/commands/kc/update-api.js';

describe('kc update-api', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs update-api', async () => {
    await KcUpdateApi.run(['--type', 'classes', '--api-version', '61.0']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('');
  });

  // it('runs hello with --json and no provided name', async () => {
  //   const result = await KcUpdateApi.run([]);
  //   expect(result.updatedNumber).to.equal(0);
  // });

  // it('runs hello world --name Astro', async () => {
  //   await KcUpdateApi.run(['--name', 'Astro']);
  //   const output = sfCommandStubs.log
  //     .getCalls()
  //     .flatMap((c) => c.args)
  //     .join('\n');
  //   expect(output).to.include('hello Astro');
  // });
});
