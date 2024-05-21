import { ux } from '@oclif/core';
import { expect } from 'chai';
import { TestContext } from '@salesforce/core/testSetup';
import { PreviewResult, printTables } from '../../src/utils/diffSource.js';

const mockRetrievePreviewOutput: PreviewResult = {
  ignored: [
    {
      fullName: 'test',
      type: 'PermissionSet',
      conflict: false,
      ignored: true,
      path: 'force-app',
      projectRelativePath: 'force-app',
      operation: 'retrieve',
    },
  ],
  conflicts: [
    {
      fullName: 'test',
      type: 'PermissionSet',
      conflict: true,
      ignored: false,
      path: 'force-app',
      projectRelativePath: 'force-app',
      operation: 'retrieve',
    },
  ],
  toDeploy: [],
  toDelete: [
    {
      fullName: 'test',
      type: 'PermissionSet',
      conflict: false,
      ignored: false,
      path: 'force-app',
      projectRelativePath: 'force-app',
      operation: 'deletePre',
    },
  ],
  toRetrieve: [
    {
      fullName: 'test',
      type: 'PermissionSet',
      conflict: false,
      ignored: false,
      path: 'force-app',
      projectRelativePath: 'force-app',
      operation: 'retrieve',
    },
  ],
};

const mockDeployPreviewOutput: PreviewResult = {
  ignored: [
    {
      fullName: 'test',
      type: 'PermissionSet',
      conflict: false,
      ignored: true,
      path: 'force-app',
      projectRelativePath: 'force-app',
      operation: 'deploy',
    },
  ],
  conflicts: [
    {
      fullName: 'test',
      type: 'PermissionSet',
      conflict: true,
      ignored: false,
      path: 'force-app',
      projectRelativePath: 'force-app',
      operation: 'deploy',
    },
  ],
  toDeploy: [
    {
      fullName: 'test',
      type: 'PermissionSet',
      conflict: false,
      ignored: false,
      path: 'force-app',
      projectRelativePath: 'force-app',
      operation: 'deploy',
    },
  ],
  toDelete: [
    {
      fullName: 'test',
      type: 'PermissionSet',
      conflict: false,
      ignored: false,
      path: 'force-app',
      projectRelativePath: 'force-app',
      operation: 'deletePre',
    },
  ],
  toRetrieve: [],
};

describe('diff table', () => {
  let tableStub: sinon.SinonStub;
  const $$ = new TestContext();

  beforeEach(() => {
    tableStub = $$.SANDBOX.stub(ux, 'table');
  });

  afterEach(() => {
    $$.restore();
  });

  it('prints output table', () => {
    printTables(mockRetrievePreviewOutput, mockDeployPreviewOutput);
    expect(tableStub.callCount).to.equal(6);
    expect(tableStub.firstCall.args[0]).to.deep.equal([
      {
        fullName: 'test',
        type: 'PermissionSet',
        conflict: true,
        ignored: false,
        path: 'force-app',
        projectRelativePath: 'force-app',
        operation: 'retrieve',
      },
      {
        fullName: 'test',
        type: 'PermissionSet',
        conflict: true,
        ignored: false,
        path: 'force-app',
        projectRelativePath: 'force-app',
        operation: 'deploy',
      },
    ]);
  });
});
