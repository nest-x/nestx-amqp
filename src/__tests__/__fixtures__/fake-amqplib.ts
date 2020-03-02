import { EventEmitter } from 'events'
import * as sinon from 'sinon'

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
    
    this.ack = sinon.spy(function() {})
    
    this.ackAll = sinon.spy(function() {})
    
    this.nack = sinon.spy(function() {})
    
    this.nackAll = sinon.spy(function() {})
    
    this.assertQueue = sinon.spy(function() {})
    
    this.bindQueue = sinon.spy(function() {})
    
    this.assertExchange = sinon.spy(function() {})
    
    this.close = sinon.spy(() => this.emit('close'))
  }
  
  publish(): void {}
  
  ack(): void {}
  
  ackAll(): void {}
  
  nack(): void {}
  
  nackAll(): void {}
  
  assertQueue(): void {}
  
  bindQueue(): void {}
  
  sendToQueue(): void {}
  
  assertExchange(): void {}
  
  close(): void {}
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
