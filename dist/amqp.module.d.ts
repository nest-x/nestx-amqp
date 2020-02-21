import { DynamicModule } from '@nestjs/common';
import { AMQPAsyncConnectionOptions, AMQPConnectionOptions } from './amqp.options';
export declare class AMQPModule {
    static register(options: AMQPConnectionOptions): DynamicModule;
    static forRootAsync(options: AMQPAsyncConnectionOptions): DynamicModule;
}
