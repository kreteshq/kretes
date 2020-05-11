const test = require('ava');
const { join } = require('path');
const { tmpdir } = require('os');
const { writeFileSync, unlinkSync } = require('fs');
const { read } = require('./filesystem');

test('it returns data from cache', async assert => {
  const dir = tmpdir();
  const filepath = join(dir, 'filesystem-test-cache-true.html');
  writeFileSync(filepath, '<div>foo</div>');
  const content1 = await read(filepath, { cache: true });
  assert.deepEqual(content1, '<div>foo</div>');
  writeFileSync(filepath, '<div>bar</div>');
  const content2 = await read(filepath, { cache: true });
  assert.deepEqual(content2, '<div>foo</div>');
  unlinkSync(filepath);
});

test('it reads data multiple time without cache', async assert => {
  const dir = tmpdir();
  const filepath = join(dir, 'filesystem-test-cache-false.html');
  writeFileSync(filepath, '<div>foo</div>');
  const content1 = await read(filepath, { cache: false });
  assert.deepEqual(content1, '<div>foo</div>');
  writeFileSync(filepath, '<div>bar</div>');
  const content2 = await read(filepath, { cache: false });
  assert.deepEqual(content2, '<div>bar</div>');
  unlinkSync(filepath);
});
