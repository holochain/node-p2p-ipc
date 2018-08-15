const EventEmitter = require('events')

/**
 */
class EventClass extends EventEmitter {
  /**
   */
  constructor (destroy) {
    super()

    this._destroyed = false
    this._nextId = Math.random()
    this._waiting = new Map()

    if (!Array.isArray(destroy)) {
      if (typeof destroy === 'function') {
        this._destroy = [destroy]
      } else {
        this._destroy = []
      }
    }

    this._destroy.push(() => {
      this.removeAllListeners()
      this.setMaxListeners(0)
      for (let ref of this._waiting.values()) {
        ref.reject(new Error('shutting down'))
      }
      this._waiting = null
    })
  }

  /**
   */
  destroy () {
    try {
      if (this._destroyed) return
      this._destroyed = true
      for (let d of this._destroy) {
        d()
      }
      this._destroy = null
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }

  // -- protected -- //

  /**
   */
  $checkDestroyed () {
    if (this._destroyed) {
      throw new Error('instance used after destruction')
    }
  }

  /**
   */
  $nextId () {
    this._nextId += 0.0001 + Math.random()
    return Buffer.from(this._nextId.toString(36))
  }

  /**
   * Watch for correlated messages from the server
   * @private
   */
  $trackMessage (messageId, timeout) {
    if (this._destroyed) return
    messageId = messageId.toString('base64')
    return new Promise(async (resolve, reject) => {
      try {
        const timeoutStack = (new Error('timeout')).stack
        const timer = setTimeout(() => {
          this._waiting.delete(messageId)
          reject(new Error('timeout, inner-stack: ' + timeoutStack))
        }, timeout)

        this._waiting.set(messageId, {
          resolve: (...args) => {
            this._waiting.delete(messageId)
            clearTimeout(timer)
            resolve(...args)
          },
          reject: (e) => {
            this._waiting.delete(messageId)
            clearTimeout(timer)
            reject(e)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   */
  $resolveWaiting (messageId, data) {
    if (this._destroyed) return
    messageId = messageId.toString('base64')
    if (!this._waiting.has(messageId)) {
      return
    }
    this._waiting.get(messageId).resolve(data)
  }

  /**
   */
  $rejectWaiting (messageId, text) {
    if (this._destroyed) return
    messageId = messageId.toString('base64')
    if (!this._waiting.has(messageId)) {
      return
    }
    this._waiting.get(messageId).reject(new Error(text))
  }

  /**
   */
  async $timeoutPromise (fn) {
    let timeout
    try {
      const timeoutStack = (new Error('timeout')).stack
      timeout = setTimeout(() => {
        throw new Error('timeout, inner-stack: ' + timeoutStack)
      }, 1000)
      const result = await new Promise(async (resolve, reject) => {
        await fn(resolve, reject)
      })
      clearTimeout(timeout)
      return result
    } catch (e) {
      clearTimeout(timeout)
      throw e
    }
  }
}

exports.EventClass = EventClass
