// const clients = new Map<number, {
//   port: MessagePort,
//   time: number,
// }>()

// self.onconnect = (e) => {
//   const port = e.source as MessagePort

//   port.onmessage = (e) => {
//     if (e.data.type === 'init') {
//       clients.set(e.data.id, { port, time: Date.now() })
//       return
//     }

//     if (e.data.type === 'pong') {
//       clients.get(e.data.id)!.time = Date.now()
//       return
//     }

//     if (e.data.type === 'sync') {
//       clients
//         .entries()
//         .filter(([id, client]) => id !== e.data.id)
//         .forEach(([id, client]) => client.port.postMessage(e.data))
//       return
//     }
//   }
// }

// const INT = 1000

// setInterval(() => {
//   for (const [id, client] of clients) {
//     if (client.time < Date.now() - INT * 2) {
//       clients.delete(id)
//     }
//   }
//   clients.forEach(c => c.port.postMessage({ type: 'ping' }))
// }, INT)
