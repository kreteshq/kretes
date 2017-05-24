const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const expect = chai.expect;

const Huncwot = require('../');
const { ok, created, html } = require('../response');

let app;
let server;

before(() => {
  app = new Huncwot();
  server = app.listen(3000);
});

describe('init', () => {
  it('GET / route, implict return', async () => {
    app.get('/', _ => 'Hello Huncwot')

    const response = await chai.request(server)
      .get('/');

    expect(response.text).to.eq('Hello Huncwot');
  });

  it('GET /a route, no required return', async () => {
    app.get('/a', _ => { 'Hello Huncwot' })

    // XXX ugly
    let response;
    try {
      response = await chai.request(server)
        .get('/a');
    } catch (e) {
      response = e.response
    }

    expect(response.status).to.eq(500);

  });

  it('GET /explicit route, explicit assignment', async () => {
    app.get('/explicit', request => {
      return { body: `Hello Explicit Assignment` }
    })

    const response = await chai.request(server)
      .get('/explicit');

    expect(response.text).to.eq('Hello Explicit Assignment');
  });

  it('GET /json route as 200 OK', async () => {
    app.get('/json-ok', _ => ok({ a: 1, b: 2 }))

    const response = await chai.request(server)
      .get('/json-ok');

    expect(response.type).to.eq('application/json');
    expect(response.status).to.eq(200);
    expect(response.body).to.have.all.keys('a', 'b');
  })

  it('GET /json route as 201 Created', async () => {
    app.get('/json-created', _ => created({ a: 1, b: 2 }))

    const response = await chai.request(server)
      .get('/json-created');

    expect(response.type).to.eq('application/json');
    expect(response.status).to.eq(201);
    expect(response.body).to.have.all.keys('a', 'b');
  })

  it('GET /hello/:foo route', async () => {
    app.get('/hello/:foo', _ => _.params.foo)

    const response = await chai.request(server)
      .get('/hello/world');

    expect(response.type).to.eq('text/plain');
    expect(response.text).to.eq('world');
  })

  it('POST /bim route, with params', async () => {
    app.post('/bim', context => {
      return `Hello ${context.params.name}!`
    })

    const response = await chai.request(server)
      .post('/bim')
      .send({ name: 'Zaiste' });

    expect(response.text).to.eq('Hello Zaiste!');
  })

  it('GET /html route, `Content-Type` as `text/html`', async () => {
    app.get('/html', _ => html('<h1>Hello HTML</h1>'));

    const response = await chai.request(server)
      .get('/html');

    expect(response.type).to.eq('text/html');
    expect(response.text).to.eq('<h1>Hello HTML</h1>');
  });
});
