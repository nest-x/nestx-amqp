import * as amqp from 'amqp-connection-manager';
import { AMQPAsyncConnectionOptions, AMQPConnectionOptions } from './amqp.options';
export declare const createAMQPConnection: () => {
    provide: symbol;
    inject: symbol[];
    useFactory: (args: AMQPConnectionOptions) => Promise<amqp.AmqpConnectionManager>;
};
export declare const createAsyncAMQPConnectionOptions: (options: AMQPAsyncConnectionOptions) => {
    provide: symbol;
    inject: any[];
    useFactory: (...args: any[]) => AMQPConnectionOptions | Promise<AMQPConnectionOptions>;
};
