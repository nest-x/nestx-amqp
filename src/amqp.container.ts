/**
 * @desc provide a container for AMQPConnectionOptions, AMQPConnection
 *       instance get/set operations
 * */
import { AmqpConnectionManager } from 'amqp-connection-manager';

export class AmqpContainer {
  private static instance: AmqpContainer;
  private static storage = new Map<string | symbol, AmqpConnectionManager>();

  private constructor() {}

  public static getInstance() {
    if (!AmqpContainer.instance) {
      AmqpContainer.instance = new AmqpContainer();
    }
    return AmqpContainer.instance;
  }

  has(name: string | symbol) {
    return AmqpContainer.storage.has(name);
  }
  get(name: string | symbol) {
    return AmqpContainer.storage.get(name);
  }

  set(name: string | symbol, connection: AmqpConnectionManager) {
    AmqpContainer.storage.set(name, connection);
  }

  async clearAndShutdown() {
    const closeConnectionTasks = [];
    AmqpContainer.storage.forEach((connection, name) => {
      closeConnectionTasks.push(
        new Promise((resolve) => {
          connection.close().then(resolve);
        })
      );
    });
    await Promise.all(closeConnectionTasks);
    AmqpContainer.storage.clear();
  }

  size() {
    return AmqpContainer.storage.size;
  }
}
