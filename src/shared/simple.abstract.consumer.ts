import * as amqp from 'amqp-connection-manager';
import { Message } from 'amqplib';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { AMQP_CONNECTION } from '../amqp.constants';
import { Options } from 'amqplib/properties';

export abstract class SimpleAbstractConsumer implements OnModuleInit {
  private readonly absLogger = new Logger(SimpleAbstractConsumer.name);

  channelWrapper: amqp.ChannelWrapper;

  abstract get queue(): string;
  abstract get queueOptions(): Options.AssertQueue;
  abstract get prefetch(): number;

  public constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: amqp.AmqpConnectionManager
  ) {
    this.channelWrapper = this.connectionManager.createChannel({
      json: true,
      setup: (channel) => {
        return Promise.all([
          channel.assertQueue(this.queue, this.queueOptions),
          channel.prefetch(this.prefetch),
          channel.consume(this.queue, (message) => {
            this.handle(JSON.parse(message.content.toString()))
              .then(() => {
                channel.ack(message);
              })
              .catch((error) => {
                this.absLogger.error(`Consume error: ${error.message}`);
                this.requeue(message);
                channel.ack(message);
              });
          })
        ]);
      }
    });
  }

  async onModuleInit() {
    await this.channelWrapper.waitForConnect();
  }

  abstract async handle(content);

  abstract async requeue(message: Message);
  abstract async drop(message: Message);
}
