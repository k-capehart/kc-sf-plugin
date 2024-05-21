import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import KcDiff, { SourceTrackInformation } from '../../../src/commands/kc/diff.js';
import { PreviewFile, Utils } from './../../../src/utils/previewOutput.js';

const stubSourceTracking: SourceTrackInformation = {
  retrieveOutput: {
    ignored: new Array<PreviewFile>(),
    conflicts: new Array<PreviewFile>(),
    toDeploy: new Array<PreviewFile>(),
    toDelete: new Array<PreviewFile>(),
    toRetrieve: new Array<PreviewFile>(),
  },
  deployOutput: {
    ignored: new Array<PreviewFile>(),
    conflicts: new Array<PreviewFile>(),
    toDeploy: new Array<PreviewFile>(),
    toDelete: new Array<PreviewFile>(),
    toRetrieve: new Array<PreviewFile>(),
  },
};

describe('kc diff', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(async () => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    $$.SANDBOX.stub(Utils, 'getComponents').returns(Promise.resolve(stubSourceTracking));
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs kc diff with no output', async () => {
    await KcDiff.run(['--target-org', 'test']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.be.empty;
  });
});
