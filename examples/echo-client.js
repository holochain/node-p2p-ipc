#!/usr/bin/env node
'use strict'

const { IpcClient } = require('../lib/index')

// IPC Echo Client Example
//
// connects to echo-server.js socket, and runs through some tests

/**
 * main async function - run through the exercises
 */
async function _main () {
  let result = null

  const cli = new IpcClient()
  cli.on('call', async (msg) => {
    const data = msg.data.toString()

    switch (data) {
      case 'srv-hello':
        console.log('echoing `srv-hello`')
        msg.resolve(Buffer.from('echo: srv-hello'))
        break
      case 'srv-error':
        console.log('echoing `srv-error`')
        msg.reject(new Error('echo: srv-error'))
        break
      default:
        console.error('unexpected ' + data)
        process.exit(1)
    }
  })

  console.log('connecting...')
  await cli.connect('ipc://echo-server.sock')
  console.log('connected')

  console.log('calling with `hello`...')
  result = await cli.call(Buffer.from('hello'))
  console.log('result: `' + result.toString() + '`')

  console.log('calling with `error`...')
  try {
    await cli.call(Buffer.from('error'))
  } catch (e) {
    console.log('result: `' + e.toString().split('\n')[0] + '`')
  }

  console.log('calling with `call-hello`...')
  result = await cli.call(Buffer.from('call-hello'))
  console.log('result: `' + result.toString() + '`')

  console.log('calling with `call-error`...')
  result = await cli.call(Buffer.from('call-error'))
  console.log('result: `' + result.toString() + '`')

  console.log('closing...')
  cli.destroy()
  console.log('closed')
}

_main().then(() => {}, (err) => {
  console.error('echo-client DIED')
  console.error(err)
  process.exit(1)
})
