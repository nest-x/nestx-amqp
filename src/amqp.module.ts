import { AmqpConnectionManager } from 'amqp-connection-manager'
import { ModuleRef } from '@nestjs/core'
import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery'
import { DynamicModule, Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import {
  AMQP_CONNECTION,
  AMQP_CONNECTION_OPTIONS,
  PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN,
  PUBLISH_QUEUE_METADATA_TOKEN,
  PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN,
  PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_CONSUMER_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_OPTIONS_METADATA_TOKEN,
} from './amqp.constants'
import { createAMQPConnection, createAsyncAMQPConnectionOptions } from './amqp.providers'
import { AMQPAsyncConnectionOptions, AMQPConnectionOptions } from './amqp.options'
import { Consumer } from './services/consumer'
import { Producer } from './services/producer'
import { getAMQPConnectionOptionsToken, getAMQPConnectionToken } from './shared/token.util'

@Global()
@Module({
  imports: [DiscoveryModule],
})
export class AMQPModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly moduleRef: ModuleRef, private readonly discover: DiscoveryService) {}

  static register(options: AMQPConnectionOptions): DynamicModule {
    return {
      module: AMQPModule,
      providers: [
        {
          provide: getAMQPConnectionOptionsToken(options.name),
          useValue: options,
        },
        createAMQPConnection(options.name),
      ],
      exports: [getAMQPConnectionToken(options.name)],
    }
  }

  static forRootAsync(options: AMQPAsyncConnectionOptions): DynamicModule {
    return {
      module: AMQPModule,
      imports: options.imports,
      providers: [
        createAsyncAMQPConnectionOptions(options),
        createAMQPConnection(options.name),
      ],
      exports: [getAMQPConnectionToken(options.name)],
    }
  }

  async onModuleInit() {
    await this.scanAndRegisterPublishQueueMethods()
    await this.scanAndRegisterSubscribeQueueMethods()
  }

  async onModuleDestroy() {
    const connection: AmqpConnectionManager = this.moduleRef.get(AMQP_CONNECTION)

    if (connection) {
      await connection.close()
    }
  }

  async scanAndRegisterPublishQueueMethods() {
    const publishQueueMethods = await this.discover.providerMethodsWithMetaAtKey(PUBLISH_QUEUE_METADATA_TOKEN)

    const connection: AmqpConnectionManager = this.moduleRef.get(AMQP_CONNECTION)

    for (const method of publishQueueMethods) {
      const originalHandler = method.discoveredMethod.handler
      const queue = Reflect.getMetadata(PUBLISH_QUEUE_METADATA_TOKEN, originalHandler)
      const queueOptions = Reflect.getMetadata(PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN, originalHandler)

      const producer = new Producer(connection, queue, queueOptions)
      await producer.onModuleInit()

      const handlerContext = method.discoveredMethod.parentClass.instance

      Reflect.defineMetadata(PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN, producer, originalHandler)
      Reflect.defineMetadata(PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN, handlerContext, originalHandler)
    }
  }

  async scanAndRegisterSubscribeQueueMethods() {
    const subscribeQueueMethods = await this.discover.providerMethodsWithMetaAtKey(SUBSCRIBE_QUEUE_METADATA_TOKEN)
    const connection: AmqpConnectionManager = this.moduleRef.get(AMQP_CONNECTION)

    for (const method of subscribeQueueMethods) {
      const originHandler = method.discoveredMethod.handler

      const queue = Reflect.getMetadata(SUBSCRIBE_QUEUE_METADATA_TOKEN, originHandler)
      const queueOptions = Reflect.getMetadata(SUBSCRIBE_QUEUE_OPTIONS_METADATA_TOKEN, originHandler)
      const consumeOptions = Reflect.getMetadata(SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN, originHandler)

      const consumer = new Consumer(connection, queue, queueOptions, consumeOptions)

      Reflect.defineMetadata(SUBSCRIBE_QUEUE_CONSUMER_METADATA_TOKEN, consumer, originHandler)

      const handlerContext = method.discoveredMethod.parentClass.instance

      await consumer.applyHandler(originHandler)
      await consumer.applyHandlerContext(handlerContext)
      await consumer.listen()
    }
  }
}
