import test from 'ava';

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { CompoundResponse } from 'retes';

import { Page } from './response';

test('Page renders html', async assert => {
  const dir = tmpdir();
  const path = join(dir, 'response-test.html');
  await fs.writeFile(path, '<div>{foo}</div>');
  const response = await Page(path, { foo: 'bar' }) as CompoundResponse;
  const { statusCode, type, body } = response;
  assert.deepEqual(statusCode, 200);
  assert.deepEqual(type, 'text/html');
  assert.deepEqual(body, '<div>bar</div>');
});
