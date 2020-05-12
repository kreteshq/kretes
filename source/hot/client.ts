import { HMRRuntime } from 'vue'

declare var __VUE_HMR_RUNTIME__: HMRRuntime

const prefix = ['%cKretes', 'color: #16b0e8']

console.log(...prefix, 'Hot Reload / setting up...');
const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
const ws = new WebSocket(`${protocol}://${location.host}`)

ws.addEventListener('message', async ({ data }) => {
  const { type, path, timestamp } = JSON.parse(data)

  let module;
  switch (type) {
    case 'connected':
      console.log(...prefix, 'Hot Reload / ready');
      break
    case 'vue:reload':
      module = await import(`${path}?t=${timestamp}`)
      __VUE_HMR_RUNTIME__.reload(path, module.default)
      console.log(...prefix, `[vue:reload] ${path}`)

      break
    case 'vue:render':
      module = await import(`${path}?type=template&t=${timestamp}`);
      __VUE_HMR_RUNTIME__.rerender(path, module.render)
      console.log(...prefix, `[vue:render] ${path}`)
      break
    case 'reload':
      location.reload()
  }
})

ws.addEventListener('close', () => {
  console.log(...prefix, `ws connection lost. Restarting...`)
  setInterval(() => {
    const ws = new WebSocket(`${protocol}://${location.host}`)
    ws.addEventListener('open', () => location.reload())
  }, 1000)
})
