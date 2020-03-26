import { AmqpConnectionManager } from 'amqp-connection-manager'
import { ModuleRef } from '@nestjs/core'
import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery'
import { DynamicModule, Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AMQPContainer } from './amqp.container'
import { getAMQPConnectionOptionsToken, getAMQPConnectionToken } from './shared/token.util'
import { createAMQPConnection, createAsyncAMQPConnectionOptions } from './amqp.providers'
import { AMQPAsyncConnectionOptions, AMQPConnectionOptions } from './amqp.options'

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
      providers: [createAsyncAMQPConnectionOptions(options), createAMQPConnection(options.name)],
      exports: [getAMQPConnectionToken(options.name)],
    }
  }

  async onModuleInit() {
  }

  async onModuleDestroy() {
    await AMQPContainer.getInstance().clearAndShutdown()
  }
}
