import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { ModuleRef } from '@nestjs/core';
import { DynamicModule, Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AmqpContainer } from './amqp.container';
import { AmqpExplorer } from './amqp.explorer';
import { getAmqpConnectionOptionsToken, getAmqpConnectionToken } from './shared/token.util';
import { createAmqpConnection, createAsyncAmqpConnectionOptions } from './amqp.providers';
import { AmqpAsyncConnectionOptions, AmqpConnectionOptions } from './amqp.options';

@Global()
@Module({
  imports: [DiscoveryModule]
})
export class AmqpModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly moduleRef: ModuleRef) {}

  static register(options: AmqpConnectionOptions): DynamicModule {
    return {
      module: AmqpModule,
      providers: [
        AmqpExplorer,
        {
          provide: getAmqpConnectionOptionsToken(options.name),
          useValue: options
        },
        createAmqpConnection(options.name)
      ],
      exports: [getAmqpConnectionToken(options.name)]
    };
  }

  static forRootAsync(options: AmqpAsyncConnectionOptions): DynamicModule {
    return {
      module: AmqpModule,
      imports: options.imports,
      providers: [AmqpExplorer, createAsyncAmqpConnectionOptions(options), createAmqpConnection(options.name)],
      exports: [getAmqpConnectionToken(options.name)]
    };
  }

  async onModuleInit() {}

  async onModuleDestroy() {
    await AmqpContainer.getInstance().clearAndShutdown();
  }
}
