#!/usr/bin/env node
'use strict'

const { IpcServer } = require('../lib/index')

// IPC Echo Server Example

/**
 */
async function _main () {
  // set up the listening socket
  const srv = new IpcServer()

  // handle ctrl-c
  process.on('SIGINT', () => {
    srv.destroy()
    console.log('socket closed')
    process.exit(0)
  })

  // debug output on connections
  srv.on('clientAdd', (id) => {
    console.log('adding client ' + id)
  })

  // debug output && mem cleanup on connection lost
  srv.on('clientRemove', (id) => {
    console.log('pruning client ' + id)
  })

  // the client sent us a `call`
  srv.on('call', async (msg) => {
    let result = null

    const data = msg.data.toString()

    switch (data) {
      case 'hello':
        console.log('echoing `hello`')
        msg.resolve(Buffer.from('echo: hello'))
        break
      case 'error':
        console.log('echoing `error`')
        msg.reject(new Error('echo: error'))
        break
      case 'call-hello':
        console.log('echoing `call-hello`')
        result = await srv.call(Buffer.from('srv-hello'))
        let res = null
        for (let r of result) {
          if (r.result) {
            res = r.result
            break
          }
        }
        if (!res) {
          return msg.reject(new Error('bad, got ' + JSON.stringify(result)))
        }
        console.log('@@ result', res)
        msg.resolve('server successfully received `' +
          res.toString() + '`')
        break
      case 'call-error':
        console.log('echoing `call-error`')
        result = await srv.call(Buffer.from('srv-error'))
        if (!result || !result[0] || !result[0].error) {
          return msg.reject(new Error('bad, got ' + JSON.stringify(result)))
        }
        msg.resolve('server successfully got error `' +
          result[0].error.toString().split('\n')[0] + '`')
        break
      default:
        console.error('unexpected ' + data)
        process.exit(1)
    }
  })

  // make sure we are listening
  await srv.bind('ipc://echo-server.sock')

  console.log('up and running')
}

_main().then(() => {}, (err) => {
  console.error(err)
  process.exit(1)
})
