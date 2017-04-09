const Huncwot = require('../lib/index');
const basicAuth = require('../lib/auth');

const app = new Huncwot();

app.use(basicAuth({ users: { 'admin': 'secret' } }))

// implicit `return`
app.get('/', _ => 'Hello Huncwot')

app.listen(3000);
