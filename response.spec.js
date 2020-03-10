const test = require('ava');
const { Page } = require('./response');
const { tmpdir } = require('os');
const { join } = require('path');
const { writeFile } = require('fs-extra');

test('Page renders html', async assert => {
  const dir = tmpdir();
  const path = join(dir, 'response-test.html');
  await writeFile(path, '<div>{foo}</div>');
  const response = await Page(path, { foo: 'bar' });
  const { statusCode, type, body } = response;
  assert.deepEqual(statusCode, 200);
  assert.deepEqual(type, 'text/html');
  assert.deepEqual(body, '<div>bar</div>');
});
