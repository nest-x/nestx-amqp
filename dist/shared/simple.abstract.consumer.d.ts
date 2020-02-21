import * as amqp from 'amqp-connection-manager';
import { Message } from 'amqplib';
import { OnModuleInit } from '@nestjs/common';
import { Options } from 'amqplib/properties';
export declare abstract class SimpleAbstractConsumer implements OnModuleInit {
    readonly connectionManager: amqp.AmqpConnectionManager;
    private readonly absLogger;
    channelWrapper: amqp.ChannelWrapper;
    abstract get queue(): string;
    abstract get queueOptions(): Options.AssertQueue;
    abstract get prefetch(): number;
    constructor(connectionManager: amqp.AmqpConnectionManager);
    onModuleInit(): Promise<void>;
    abstract handle(content: any): any;
    abstract requeue(message: Message): any;
    abstract drop(message: Message): any;
}
