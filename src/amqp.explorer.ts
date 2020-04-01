import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AmqpConnectionManager } from 'amqp-connection-manager'
import {
  PUBLISH_EXCHANGE_CONTEXT_METADATA_TOKEN,
  PUBLISH_EXCHANGE_METADATA_TOKEN,
  PUBLISH_EXCHANGE_PRODUCER_METADATA_TOKEN,
  PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN,
  PUBLISH_QUEUE_METADATA_TOKEN,
  PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_CONSUMER_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_CONTEXT_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_METADATA_TOKEN,
  USE_AMQP_CONNECTION_TOKEN,
  SUBSCRIBE_EXCHANGE_CONSUMER_METADATA_TOKEN,
  SUBSCRIBE_EXCHANGE_CONTEXT_METADATA_TOKEN,
  SUBSCRIBE_EXCHANGE_OPTIONS_METADATA_TOKEN,
  SUBSCRIBE_EXCHANGE_QUEUE_OPTIONS_METADATA_TOKEN,
} from './amqp.constants'
import { Exchange, ConsumeExchangeOptions } from './interfaces/exchange'
import { ConsumeQueueOptions, Queue } from './interfaces/queue'
import { QueueConsumer } from './services/queue-consumer'
import { ExchangeProducer } from './services/exchange-producer'
import { QueueProducer } from './services/queue-producer'
import { getAMQPConnectionToken } from './shared/token.util'
import { ExchangeConsumer } from './services/exchange-consumer'

@Injectable()
export class AMQPExplorer implements OnModuleInit {
  private readonly logger = new Logger(AMQPExplorer.name)

  constructor(private readonly moduleRef: ModuleRef, private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    await this.explore()
  }

  async explore() {
    await this.registerPublishQueueMethods()
    await this.registerPublishExchangeMethods()
    await this.registerSubscribeQueueMethods()
    await this.registerSubscribeExchangeMethods()
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

      const producer = new QueueProducer(connection, queue)
      await producer.onModuleInit()

      Reflect.defineMetadata(PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN, producer, originalHandler)
      Reflect.defineMetadata(PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN, handlerContext, originalHandler)

      this.logger.log(
        `Found ${method.discoveredMethod.parentClass.name}#${method.discoveredMethod.methodName} using @PublishQueue()`
      )
    }
  }

  private async registerPublishExchangeMethods() {
    const publishExchangeMethods = await this.discoveryService.providerMethodsWithMetaAtKey(
      PUBLISH_EXCHANGE_METADATA_TOKEN
    )

    for (const method of publishExchangeMethods) {
      const originalHandler = method.discoveredMethod.handler

      const connectionName = Reflect.getMetadata(USE_AMQP_CONNECTION_TOKEN, originalHandler)
      const injectConnectionToken = getAMQPConnectionToken(connectionName)
      const connection: AmqpConnectionManager = this.moduleRef.get<AmqpConnectionManager>(injectConnectionToken)
      const exchange: Exchange = Reflect.getMetadata(PUBLISH_EXCHANGE_METADATA_TOKEN, originalHandler)
      const handlerContext = method.discoveredMethod.parentClass.instance

      const producer = new ExchangeProducer(connection, exchange)
      await producer.onModuleInit()

      Reflect.defineMetadata(PUBLISH_EXCHANGE_PRODUCER_METADATA_TOKEN, producer, originalHandler)
      Reflect.defineMetadata(PUBLISH_EXCHANGE_CONTEXT_METADATA_TOKEN, handlerContext, originalHandler)

      this.logger.log(
        `Found ${method.discoveredMethod.parentClass.name}#${method.discoveredMethod.methodName} using @PublishExchange()`
      )
    }
  }

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

      const consumer = new QueueConsumer(connection, queue, consumeOptions)

      await consumer.applyHandler(originalHandler)
      await consumer.applyContext(handlerContext)

      Reflect.defineMetadata(SUBSCRIBE_QUEUE_CONSUMER_METADATA_TOKEN, consumer, originalHandler)
      Reflect.defineMetadata(SUBSCRIBE_QUEUE_CONTEXT_METADATA_TOKEN, handlerContext, originalHandler)

      this.logger.log(
        `Found ${method.discoveredMethod.parentClass.name}#${method.discoveredMethod.methodName} using @SubscribeQueue()`
      )
      await consumer.listen()
    }
  }

  private async registerSubscribeExchangeMethods() {
    const subscribeExchangeMethods = await this.discoveryService.providerMethodsWithMetaAtKey(
      SUBSCRIBE_EXCHANGE_OPTIONS_METADATA_TOKEN
    )
    for (const method of subscribeExchangeMethods) {
      const originalHandler = method.discoveredMethod.handler

      const connectionName = Reflect.getMetadata(USE_AMQP_CONNECTION_TOKEN, originalHandler)
      const injectConnectionToken = getAMQPConnectionToken(connectionName)
      const connection: AmqpConnectionManager = this.moduleRef.get<AmqpConnectionManager>(injectConnectionToken)

      const queueOptions: ConsumeQueueOptions = Reflect.getMetadata(
        SUBSCRIBE_EXCHANGE_QUEUE_OPTIONS_METADATA_TOKEN,
        originalHandler
      )
      const exchangeOptions: ConsumeExchangeOptions = Reflect.getMetadata(
        SUBSCRIBE_EXCHANGE_OPTIONS_METADATA_TOKEN,
        originalHandler
      )

      const handlerContext = method.discoveredMethod.parentClass.instance

      const consumer = new ExchangeConsumer(connection, exchangeOptions, queueOptions)

      await consumer.applyHandler(originalHandler)
      await consumer.applyContext(handlerContext)

      Reflect.defineMetadata(SUBSCRIBE_EXCHANGE_CONSUMER_METADATA_TOKEN, consumer, originalHandler)
      Reflect.defineMetadata(SUBSCRIBE_EXCHANGE_CONTEXT_METADATA_TOKEN, handlerContext, originalHandler)

      this.logger.log(
        `Found ${method.discoveredMethod.parentClass.name}#${method.discoveredMethod.methodName} using @SubscribeExchange()`
      )
      await consumer.listen()
    }
  }
}
