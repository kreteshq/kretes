const test = require('ava');
const { render } = require('./view');
const { join } = require('path');
const { tmpdir } = require('os');
const { writeFile } = require('fs-extra');

test('it renders html', async assert => {
  const source = '<div>foo</div>';
  const html = await render(source);
  assert.deepEqual(html, '<div>foo</div>');
});

test('it accepts context', async assert => {
  const source = '<div>{foo}</div>';
  const context = { foo: 'Hello, world!' };
  const html = await render(source, { context });
  assert.deepEqual(html, '<div>Hello, world!</div>');
});

test('it escapes html', async assert => {
  const source = '<div>{foo}</div>';
  const context = { foo: '<script>alert(42);</script>' };
  const html = await render(source, { context });
  assert.deepEqual(html, '<div>&lt;script&gt;alert(42);&lt;/script&gt;</div>');
});

test('it accepts paths', async assert => {
  const source = '<import foo from="./foo.html"/><foo/>';
  const dir = tmpdir();
  const path = join(dir, 'foo.html');
  await writeFile(path, 'bar');
  const html = await render(source, { paths: [dir] });
  assert.deepEqual(html, 'bar');
});
