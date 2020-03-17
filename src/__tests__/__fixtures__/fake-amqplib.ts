import * as _ from 'lodash'
import * as sinon from 'sinon'
import { EventEmitter } from 'events'


export class FakeAMQP {
  private connection
  private url
  private failConnections
  private deadServers
  private connect

  constructor() {
    this.reset()
  }

  kill(): void {
    const err = new Error('Died in a fire')
    this.connection.emit('error', err)
    this.connection.emit('close', err)
  }

  simulateRemoteClose(): void {
    this.connection.emit('close', new Error('Connection closed'))
  }

  simulateRemoteBlock(): void {
    this.connection.emit('blocked', new Error('Connection blocked'))
  }

  simulateRemoteUnblock(): void {
    this.connection.emit('unblocked')
  }

  reset(): void {
    this.connection = null
    this.url = null
    this.failConnections = false
    this.deadServers = []
    this.connect = sinon.spy((url) => {
      if (this.failConnections) {
        return Promise.reject(new Error('No'))
      }

      let allowConnection = true
      this.deadServers.forEach((deadUrl) => {
        if (url.startsWith(deadUrl)) {
          allowConnection = false
        }
      })
      if (!allowConnection) {
        return Promise.reject(new Error(`Dead server ${url}`))
      }

      this.connection = new exports.FakeConnection(url)
      return Promise.resolve(this.connection)
    })
  }
}

export class FakeConfirmChannel extends EventEmitter {
  constructor() {
    super()
    this.publish = sinon.spy((exchange, routingKey, content, options, callback) => {
      this.emit('publish', content)
      callback(null)
      return true
    })

    this.sendToQueue = sinon.spy((queue, content, options, callback) => {
      this.emit('sendToQueue', content)
      callback(null)
      return true
    })

    this.ack = sinon.spy(_.noop)

    this.ackAll = sinon.spy(_.noop)

    this.nack = sinon.spy(_.noop)

    this.nackAll = sinon.spy(_.noop)

    this.assertQueue = sinon.spy(_.noop)

    this.bindQueue = sinon.spy(_.noop)

    this.assertExchange = sinon.spy(_.noop)

    this.close = sinon.spy(() => this.emit('close'))
  }

  publish(): void {return}

  ack(): void {return}

  ackAll(): void {return}

  nack(): void {return}

  nackAll(): void {return}

  assertQueue(): void {return}

  bindQueue(): void {return}

  sendToQueue(): void {return}

  assertExchange(): void {return}

  close(): void {return}
}

export class FakeConnection extends EventEmitter {
  private url
  private _closed

  constructor(url) {
    super()
    this.url = url
    this._closed = false
  }

  createConfirmChannel(): Promise<new () => void> {
    return Promise.resolve(new exports.FakeConfirmChannel())
  }

  close(): Promise<void> {
    this._closed = true
    return Promise.resolve()
  }
}

export class FakeAmqpConnectionManager extends EventEmitter {
  private connected
  private _currentConnection

  constructor() {
    super()
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }

  simulateConnect(): void {
    const url = 'amqp://localhost'
    this._currentConnection = new exports.FakeConnection(url)
    this.connected = true
    this.emit('connect', {
      connection: this._currentConnection,
      url,
    })
  }

  simulateDisconnect(): void {
    this._currentConnection = null
    this.connected = false
    this.emit('disconnect', {
      err: new Error('Boom!'),
    })
  }
}
