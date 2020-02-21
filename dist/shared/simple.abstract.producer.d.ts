import { OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { Options } from 'amqplib/properties';
export declare abstract class SimpleAbstractProducer implements OnModuleInit {
    readonly connectionManager: amqp.AmqpConnectionManager;
    channelWrapper: amqp.ChannelWrapper;
    abstract get queue(): string;
    abstract get queueOptions(): Options.AssertQueue;
    constructor(connectionManager: amqp.AmqpConnectionManager);
    onModuleInit(): Promise<void>;
    send(message: any, options?: Options.Publish): Promise<void>;
}
