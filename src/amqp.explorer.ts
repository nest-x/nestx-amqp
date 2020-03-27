import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AmqpConnectionManager } from 'amqp-connection-manager'
import {
  PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN,
  PUBLISH_QUEUE_METADATA_TOKEN,
  PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_CONSUMER_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_CONTEXT_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_METADATA_TOKEN,
  USE_AMQP_CONNECTION_TOKEN,
} from './amqp.constants'
import { ConsumeQueueOptions, Queue } from './interfaces/queue'
import { Consumer } from './services/consumer'
import { Producer } from './services/producer'
import { getAMQPConnectionToken } from './shared/token.util'

@Injectable()
export class AMQPExplorer implements OnModuleInit {
  constructor(private readonly moduleRef: ModuleRef, private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    await this.explore()
  }

  async explore() {
    await this.registerPublishQueueMethods()
    await this.registerSubscribeQueueMethods()
  }

  /**
   * @desc discover all providers' method with `@PublishQueue`, create producer instance
   * */
  private async registerPublishQueueMethods() {
    /** scan all `@PublishQueue` methods */
    const publishQueueMethods = await this.discoveryService.providerMethodsWithMetaAtKey(PUBLISH_QUEUE_METADATA_TOKEN)

    /** create all queue producer with spec connection if have `@UseConnection` */
    for (const method of publishQueueMethods) {
      const originalHandler = method.discoveredMethod.handler

      const connectionName = Reflect.getMetadata(USE_AMQP_CONNECTION_TOKEN, originalHandler)
      const injectConnectionToken = getAMQPConnectionToken(connectionName)
      const connection: AmqpConnectionManager = this.moduleRef.get<AmqpConnectionManager>(injectConnectionToken)
      const queue: Queue = Reflect.getMetadata(PUBLISH_QUEUE_METADATA_TOKEN, originalHandler)
      const handlerContext = method.discoveredMethod.parentClass.instance

      const producer = new Producer(connection, queue)
      await producer.onModuleInit()

      Reflect.defineMetadata(PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN, producer, originalHandler)
      Reflect.defineMetadata(PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN, handlerContext, originalHandler)
    }
  }

  // TODO: impl
  private async registerPublishExchangeMethods() {}

  private async registerSubscribeQueueMethods() {
    const subscribeQueueMethods = await this.discoveryService.providerMethodsWithMetaAtKey(
      SUBSCRIBE_QUEUE_METADATA_TOKEN
    )

    for (const method of subscribeQueueMethods) {
      const originalHandler = method.discoveredMethod.handler

      const connectionName = Reflect.getMetadata(USE_AMQP_CONNECTION_TOKEN, originalHandler)
      const injectConnectionToken = getAMQPConnectionToken(connectionName)
      const connection: AmqpConnectionManager = this.moduleRef.get<AmqpConnectionManager>(injectConnectionToken)

      const queue: Queue = Reflect.getMetadata(SUBSCRIBE_QUEUE_METADATA_TOKEN, originalHandler)
      const consumeOptions: ConsumeQueueOptions = Reflect.getMetadata(
        SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN,
        originalHandler
      )

      const handlerContext = method.discoveredMethod.parentClass.instance

      const consumer = new Consumer(connection, queue, consumeOptions)

      await consumer.applyHandler(originalHandler)
      await consumer.applyContext(handlerContext)

      Reflect.defineMetadata(SUBSCRIBE_QUEUE_CONSUMER_METADATA_TOKEN, consumer, originalHandler)
      Reflect.defineMetadata(SUBSCRIBE_QUEUE_CONTEXT_METADATA_TOKEN, handlerContext, originalHandler)

      await consumer.listen()
    }
  }
}
