const Huncwot = require('huncwot');
const { page } = require('huncwot/view');
const name = require('./package.json').author;

const app = new Huncwot();

app.get('/', request => page('index', { name }))

app.listen(3000);
