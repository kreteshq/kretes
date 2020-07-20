const test = require('ava');
const { render, precompile } = require('./view');
const { join } = require('path');
const { tmpdir } = require('os');

import { promises as fs } from 'fs';

test('render: it renders html', async assert => {
  const source = '<div>foo</div>';
  const html = await render(source);
  assert.deepEqual(html, '<div>foo</div>');
});

test('render: it accepts context', async assert => {
  const source = '<div>{foo}</div>';
  const context = { foo: 'Hello, world!' };
  const html = await render(source, { context });
  assert.deepEqual(html, '<div>Hello, world!</div>');
});

test('render: it escapes html', async assert => {
  const source = '<div>{foo}</div>';
  const context = { foo: '<script>alert(42);</script>' };
  const html = await render(source, { context });
  assert.deepEqual(html, '<div>&lt;script&gt;alert(42);&lt;/script&gt;</div>');
});

test('render: it accepts paths', async assert => {
  const source = '<import foo from="./foo.html"/><foo/>';
  const dir = tmpdir();
  const path = join(dir, 'foo.html');
  await fs.writeFile(path, 'bar');
  const html = await render(source, { paths: [dir] });
  assert.deepEqual(html, 'bar');
});

test('precompile: it precompiles files', async assert => {
  const files = [
    {
      path: '/foo/bar.html',
      source: '<div>{foo}</div>'
    },
    {
      path: '/baz/qux.html',
      source: '<div>{baz}</div>'
    }
  ]
  const output1 = await precompile(files)
  assert.deepEqual(output1[0].template({ foo: 'bar' }, html => html), '<div>bar</div>')
  assert.deepEqual(output1[1].template({ baz: 'qux' }, html => html), '<div>qux</div>')
  assert.deepEqual(output1[0].from, 'generator')
  assert.deepEqual(output1[1].from, 'generator')
  const output2 = await precompile(files)
  assert.deepEqual(output2[0].template({ foo: 'bar' }, html => html), '<div>bar</div>')
  assert.deepEqual(output2[1].template({ baz: 'qux' }, html => html), '<div>qux</div>')
  assert.deepEqual(output2[0].from, 'cache')
  assert.deepEqual(output2[1].from, 'cache')
});
