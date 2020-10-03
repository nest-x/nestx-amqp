import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { OnModuleInit } from '@nestjs/common';
import { Options } from 'amqplib';
import { Queue } from '../interfaces/queue';

export class QueueProducer implements OnModuleInit {
  private $channel: ChannelWrapper;

  constructor(readonly connection: AmqpConnectionManager, readonly queue: Queue) {}

  async onModuleInit() {
    this.$channel = this.connection.createChannel({
      json: true,
      setup: (channel) => {
        return channel.assertQueue(this.queue.name, this.queue.options);
      }
    });
    await this.$channel.waitForConnect();
  }

  async send(content, options?: Options.Publish) {
    await this.$channel.sendToQueue(this.queue.name, content, options);
  }
}
