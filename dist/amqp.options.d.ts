import * as amqp from 'amqp-connection-manager';
import { ModuleMetadata } from '@nestjs/common/interfaces';
export declare type AMQPConnectURLString = string;
export interface AMQPConnectionOptions {
    urls: AMQPConnectURLString[];
    options?: amqp.AmqpConnectionManagerOptions;
}
export interface AMQPAsyncConnectionOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: any[];
    useFactory?: (...args: any[]) => AMQPConnectionOptions | Promise<AMQPConnectionOptions>;
}
