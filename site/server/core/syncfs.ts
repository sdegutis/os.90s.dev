const clients = new Map<number, {
  port: MessagePort,
  time: number,
}>()


self.onconnect = (e) => {
  const port = e.source as MessagePort

  port.onmessage = (e) => {
    if (e.data.type === 'init') {
      clients.set(e.data.id, { port, time: Date.now() })
      return
    }

    if (e.data.type === 'pong') {
      clients.get(e.data.id)!.time = Date.now()
      return
    }

    console.log('syncfs got msg', e.data)
  }
}

const INT = 1000

setInterval(() => {
  for (const [id, client] of clients) {
    if (client.time < Date.now() - INT * 2) {
      console.log('deleting')
      clients.delete(id)
    }
  }
  clients.forEach(c => c.port.postMessage({ type: 'ping' }))
}, INT)
