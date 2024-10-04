import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as fs from 'node:fs';
import { expect } from 'chai';
import { ux } from '@oclif/core';
import KcUpdateApi from '../../../src/commands/kc/update-api.js';

describe('kc update-api', () => {
  it('runs update-api and throws error if no api-version is provided', async () => {
    try {
      const output = await KcUpdateApi.run(['--type', 'classes']);
      expect.fail(`Should throw an error. Response: ${JSON.stringify(output)}`);
    } catch (e) {
      expect((e as Error).message).to.include('Missing required flag api-version');
    }
  });

  it('runs update-api and throws error if no type is provided', async () => {
    try {
      const output = await KcUpdateApi.run(['--api-version', '61.0']);
      expect.fail(`Should throw an error. Response: ${JSON.stringify(output)}`);
    } catch (e) {
      expect((e as Error).message).to.include('Missing required flag type');
    }
  });

  it('runs update-api and throws error if invalid api version given', async () => {
    try {
      const output = await KcUpdateApi.run(['--type', 'classes', '--api-version', '10.0']);
      expect.fail(`Should throw an error. Response: ${JSON.stringify(output)}`);
    } catch (e) {
      expect((e as Error).message).to.include('The API version must be greater than');
    }
  });

  describe('update xml files', () => {
    const filename = fileURLToPath(import.meta.url);
    const fileDirName = dirname(filename);
    const xmlFilesPath = join(fileDirName, '../../xml');
    const xmlBackupPath = join(fileDirName, '../../backup');

    beforeEach(async () => {
      try {
        fs.cpSync(xmlFilesPath, xmlBackupPath, { recursive: true });
        if (!fs.existsSync(xmlBackupPath)) {
          throw new Error(`Backup XML directory does not exist: ${xmlFilesPath}`);
        }
      } catch (error: unknown) {
        ux.error(error as Error);
      }
    });

    afterEach(async () => {
      try {
        fs.rmSync(xmlFilesPath, { recursive: true, force: true });
        fs.cpSync(xmlBackupPath, xmlFilesPath, { recursive: true });
        fs.rmSync(xmlBackupPath, { recursive: true, force: true });
      } catch (error: unknown) {
        ux.error(error as Error);
      }
    });

    it('runs update-api to update 2 apex classes', async () => {
      const result = await KcUpdateApi.run(['-d', xmlFilesPath, '--type', 'classes', '--api-version', '61.0']);
      expect(result.updatedNumber).to.equal(2);
    });

    it('runs update-api to update 1 apex class', async () => {
      const result = await KcUpdateApi.run(['-d', xmlFilesPath, '--type', 'classes', '--api-version', '58.0']);
      expect(result.updatedNumber).to.equal(1);
    });

    it('runs update-api to update 1 trigger', async () => {
      const result = await KcUpdateApi.run(['-d', xmlFilesPath, '--type', 'triggers', '--api-version', '60.0']);
      expect(result.updatedNumber).to.equal(1);
    });

    it('runs update-api to update 1 flow', async () => {
      const result = await KcUpdateApi.run(['-d', xmlFilesPath, '--type', 'flows', '--api-version', '60.0']);
      expect(result.updatedNumber).to.equal(1);
    });

    it('runs update-api to update classes, triggers, and flows', async () => {
      const result = await KcUpdateApi.run([
        '-d',
        xmlFilesPath,
        '--type',
        'classes',
        '--type',
        'triggers',
        '--type',
        'flows',
        '--api-version',
        '60.0',
      ]);
      expect(result.updatedNumber).to.equal(4);
    });
  });
});
