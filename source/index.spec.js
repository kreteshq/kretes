const test = require('ava');
const App = require('.');

test('App: setup', async assert => {
  const app = new App();
  assert.deepEqual(typeof app.setup, 'function');
});
