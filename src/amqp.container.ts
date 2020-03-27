/**
 * @desc provide a container for AMQPConnectionOptions, AMQPConnection
 *       instance get/set operations
 * */
import { AmqpConnectionManager } from 'amqp-connection-manager'

export class AMQPContainer {
  private static instance: AMQPContainer
  private static storage = new Map<string | symbol, AmqpConnectionManager>()

  private constructor() {}

  public static getInstance() {
    if (!AMQPContainer.instance) {
      AMQPContainer.instance = new AMQPContainer()
    }
    return AMQPContainer.instance
  }

  has(name: string | symbol) {
    return AMQPContainer.storage.has(name)
  }
  get(name: string | symbol) {
    return AMQPContainer.storage.get(name)
  }

  set(name: string | symbol, connection: AmqpConnectionManager) {
    AMQPContainer.storage.set(name, connection)
  }

  async clearAndShutdown() {
    let closeConnectionTasks = []
    AMQPContainer.storage.forEach((connection, name) => {
      closeConnectionTasks.push(
        new Promise((resolve) => {
          connection.close().then(resolve)
        })
      )
    })
    await Promise.all(closeConnectionTasks)
    AMQPContainer.storage.clear()
  }

  size() {
    return AMQPContainer.storage.size
  }
}
