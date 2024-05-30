import { expect } from 'chai';
import KcTriggerFramework from '../../../src/commands/kc/trigger-framework.js';

describe('kc apex-factory trigger-framework trigger unit tests', () => {
  it('throws an error when neither --sobject or --init flags are used', async () => {
    try {
      const response = await KcTriggerFramework.run(['--template', '1']);
      expect.fail(`Should throw an error. Response: ${JSON.stringify(response)}`);
    } catch (e) {
      expect((e as Error).message).to.include('Exactly one of the following must be provided: --init, --sobject');
    }
  });

  it('throws an error when the --sobject and --init flags are both given', async () => {
    try {
      const response = await KcTriggerFramework.run(['--template', '1', '--init', '--sobject', 'Account']);
      expect.fail(`Should throw an error. Response: ${JSON.stringify(response)}`);
    } catch (e) {
      expect((e as Error).message).to.include('--init cannot also be provided when using --sobject');
      expect((e as Error).message).to.include('--sobject cannot also be provided when using --init');
    }
  });

  it('throws an error when --template and --custom-template flags are both given', async () => {
    try {
      const response = await KcTriggerFramework.run(['--template', '1', '--custom-template', '/', '--init']);
      expect.fail(`Should throw an error. Response: ${JSON.stringify(response)}`);
    } catch (e) {
      expect((e as Error).message).to.include('--custom-template cannot also be provided when using --template');
      expect((e as Error).message).to.include('--template cannot also be provided when using --custom-template');
    }
  });
});
