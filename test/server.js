const test = require('ava')
const axios = require('axios')
const Huncwot = require('..')

test('server.get', async assert => {
  const server = new Huncwot()
  server.get('/', _ => 'Hello, GET!')
  await server.start()
  const http = axios.create({ baseURL: `http://localhost:${server.port}` })
  const response = await http.get('/')
  assert.deepEqual(response.data, 'Hello, GET!')
  await server.stop()
})

test('server.post', async assert => {
  const server = new Huncwot()
  server.post('/', _ => 'Hello, POST!')
  await server.start()
  const http = axios.create({ baseURL: `http://localhost:${server.port}` })
  const response = await http.post('/')
  assert.deepEqual(response.data, 'Hello, POST!')
  await server.stop()
})

test('server.put', async assert => {
  const server = new Huncwot()
  server.put('/', _ => 'Hello, PUT!')
  await server.start()
  const http = axios.create({ baseURL: `http://localhost:${server.port}` })
  const response = await http.put('/')
  assert.deepEqual(response.data, 'Hello, PUT!')
  await server.stop()
})

test('server.delete', async assert => {
  const server = new Huncwot()
  server.delete('/', _ => 'Hello, DELETE!')
  await server.start()
  const http = axios.create({ baseURL: `http://localhost:${server.port}` })
  const response = await http.delete('/')
  assert.deepEqual(response.data, 'Hello, DELETE!')
  await server.stop()
})
