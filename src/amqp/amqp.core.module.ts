import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  AMQPAsyncConnectionOptions,
  AMQPConnectionOptions,
} from './amqp.options';
import {
  createAMQPConnection,
  createAsyncAMQPConnectionOptions,
} from './amqp.providers';

@Global()
@Module({})
export class AMQPCoreModule {
  static register(options: AMQPConnectionOptions): DynamicModule {
    return {
      module: AMQPCoreModule,
      providers: [createAMQPConnection()],
    };
  }

  static forRootAsync(options: AMQPAsyncConnectionOptions): DynamicModule {
    return {
      module: AMQPCoreModule,
      imports: options.imports,
      providers: [
        createAMQPConnection(),
        createAsyncAMQPConnectionOptions(options),
      ],
      exports: [],
    };
  }
}
