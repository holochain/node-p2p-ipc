#!/usr/bin/env node
'use strict'

const { IpcServer } = require('../lib/index')

// IPC Echo Server Example

function l (...args) {
  args.unshift('#echo-server#')
  args.push('#')
  console.log(...args)
}

/**
 */
async function _main () {
  // set up the listening socket
  const srv = new IpcServer()

  // handle ctrl-c
  process.on('SIGINT', () => {
    srv.destroy()
    l('echo-server closed')
    process.exit(0)
  })

  // debug output on connections
  srv.on('clientAdd', (id) => {
    l('adding client', id)
  })

  // debug output && mem cleanup on connection lost
  srv.on('clientRemove', (id) => {
    l('pruning client', id)
  })

  // the client sent us a `call`
  srv.on('call', async (msg) => {
    let result = null

    const data = msg.data.toString()

    switch (data) {
      case 'hello':
        l('client:', '`hello`', 'sending:', '`echo: hello`')
        msg.resolve(Buffer.from('echo: hello'))
        break
      case 'error':
        l('client:', '`error`', 'sending fail:', '`echo: error`')
        msg.reject(new Error('echo: error'))
        break
      case 'call-hello':
        l('client:', '`call-hello`', 'making `srv-hello` call')
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
        res = res.toString()
        l('client:', '`' + res + '`', 'sending:', '`srv-got: ' + res + '`')
        msg.resolve('srv-got: `' + res + '`')
        break
      case 'call-error':
        l('client:', '`call-error`', 'making `srv-error` call')
        result = await srv.call(Buffer.from('srv-error'))
        if (!result || !result[0] || !result[0].error) {
          return msg.reject(new Error('bad, got ' + JSON.stringify(result)))
        }
        result = result[0].error.toString().split('\n')[0]
        l('client:', '`' + result + '`', 'sending:', '`srv-got: ' + result + '`')
        msg.resolve('srv-got: `' + result + '`')
        break
      default:
        console.error('unexpected ' + data)
        process.exit(1)
    }
  })

  // make sure we are listening
  await srv.bind('ipc://echo-server.sock')

  l('echo-server listening')
}

_main().then(() => {}, (err) => {
  console.error(err)
  process.exit(1)
})
