import { Inject, OnModuleInit } from '@nestjs/common';
import { AMQP_CONNECTION } from '../amqp.constants';
import * as amqp from 'amqp-connection-manager';
import { Options } from 'amqplib/properties';

export abstract class SimpleAbstractProducer implements OnModuleInit {
  channelWrapper: amqp.ChannelWrapper;

  abstract get queue(): string;
  abstract get queueOptions(): Options.AssertQueue;

  public constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: amqp.AmqpConnectionManager,
  ) {}

  async onModuleInit() {
    this.channelWrapper = this.connectionManager.createChannel({
      json: true,
      setup: channel => {
        return channel.assertQueue(this.queue);
      },
    });
    await this.channelWrapper.waitForConnect();
  }

  async send(message, options?: Options.Publish) {
    await this.channelWrapper.sendToQueue(this.queue, message, options);
  }
}
