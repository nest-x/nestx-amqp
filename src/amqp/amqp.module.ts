import { DynamicModule, Global, Module } from '@nestjs/common';
import { AMQP_CONNECTION, AMQP_CONNECTION_OPTIONS } from './amqp.constants';
import {
  createAMQPConnection,
  createAsyncAMQPConnectionOptions,
} from './amqp.providers';
import {
  AMQPAsyncConnectionOptions,
  AMQPConnectionOptions,
} from './amqp.options';

@Global()
@Module({})
export class AMQPModule {
  static register(options: AMQPConnectionOptions): DynamicModule {
    return {
      module: AMQPModule,
      providers: [
        {
          provide: AMQP_CONNECTION_OPTIONS,
          useValue: options,
        },
        createAMQPConnection(),
      ],
      exports: [AMQP_CONNECTION],
    };
  }

  static forRootAsync(options: AMQPAsyncConnectionOptions): DynamicModule {
    return {
      module: AMQPModule,
      imports: options.imports,
      providers: [
        {
          provide: AMQP_CONNECTION_OPTIONS,
          useValue: options,
        },
        createAsyncAMQPConnectionOptions(options),
        createAMQPConnection(),
      ],
      exports: [AMQP_CONNECTION],
    };
  }
}

export * from './amqp.constants';
export * from './amqp.options';
export * from './amqp.providers';
