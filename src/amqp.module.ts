import * as amqp from 'amqp-connection-manager'
import { ModuleRef } from '@nestjs/core'
import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery'
import { DynamicModule, Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import {
  AMQP_CONNECTION,
  AMQP_CONNECTION_OPTIONS,
  PUBLISH_QUEUE_METADATA_TOKEN,
  PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN,
  PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN
} from './amqp.constants'
import { createAMQPConnection, createAsyncAMQPConnectionOptions } from './amqp.providers'
import { AMQPAsyncConnectionOptions, AMQPConnectionOptions } from './amqp.options'
import { Producer } from './services/producer'

@Global()
@Module({
  imports: [DiscoveryModule]
})
export class AMQPModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly moduleRef: ModuleRef, private readonly discover: DiscoveryService) {}

  static register(options: AMQPConnectionOptions): DynamicModule {
    return {
      module: AMQPModule,
      providers: [
        {
          provide: AMQP_CONNECTION_OPTIONS,
          useValue: options
        },
        createAMQPConnection()
      ],
      exports: [AMQP_CONNECTION]
    }
  }

  static forRootAsync(options: AMQPAsyncConnectionOptions): DynamicModule {
    return {
      module: AMQPModule,
      imports: options.imports,
      providers: [
        {
          provide: AMQP_CONNECTION_OPTIONS,
          useValue: options
        },
        createAsyncAMQPConnectionOptions(options),
        createAMQPConnection()
      ],
      exports: [AMQP_CONNECTION]
    }
  }

  async onModuleInit() {
    await this.scanPublishQueueMethods()
  }

  async onModuleDestroy() {
    const connection: amqp.AmqpConnectionManager = this.moduleRef.get(AMQP_CONNECTION)

    if (connection) {
      console.log(`shutting down amqp connection`)
      await connection.close()
    }
  }

  async scanPublishQueueMethods() {
    const publishQueueMethods = await this.discover.providerMethodsWithMetaAtKey(PUBLISH_QUEUE_METADATA_TOKEN)

    const connection: amqp.AmqpConnectionManager = this.moduleRef.get(AMQP_CONNECTION)

    for (const method of publishQueueMethods) {
      const originalHandler = method.discoveredMethod.handler
      const queue = Reflect.getMetadata(PUBLISH_QUEUE_METADATA_TOKEN, originalHandler)
      const queueOptions = Reflect.getMetadata(PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN, originalHandler)

      const producer = new Producer(connection, queue, queueOptions)
      await producer.onModuleInit()
      Reflect.defineMetadata(PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN, producer, originalHandler)
    }
  }
}
