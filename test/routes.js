const test = require('ava')
const axios = require('axios')
const Huncwot = require('..')

test('routes should be passed to the start method', async assert => {
  const server = new Huncwot()
  const routes = {
    get: { '/': _ => 'Hello, GET!' },
    post: { '/': _ => 'Hello, POST!' },
    put: { '/': _ => 'Hello, PUT!' },
    delete: { '/': _ => 'Hello, DELETE!' }
  }
  await server.start({ routes })
  const http = axios.create({ baseURL: `http://localhost:${server.port}` })
  const response1 = await http.get('/')
  const response2 = await http.post('/')
  const response3 = await http.put('/')
  const response4 = await http.delete('/')
  assert.deepEqual(response1.data, 'Hello, GET!')
  assert.deepEqual(response2.data, 'Hello, POST!')
  assert.deepEqual(response3.data, 'Hello, PUT!')
  assert.deepEqual(response4.data, 'Hello, DELETE!')
  await server.stop()
})
