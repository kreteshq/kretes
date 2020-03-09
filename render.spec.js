const test = require('ava');
const { render } = require('./render');

test('it renders html', async assert => {
  const source = '<div>{foo}</div>';
  const context = { foo: 'Hello, world!' };
  const html = await render(source, context);
  assert.deepEqual(html, '<div>Hello, world!</div>');
});

test('it escapes html', async assert => {
  const source = '<div>{foo}</div>';
  const context = { foo: '<script>alert(42);</script>' };
  const html = await render(source, context);
  assert.deepEqual(html, '<div>&lt;script&gt;alert(42);&lt;/script&gt;</div>');
});

