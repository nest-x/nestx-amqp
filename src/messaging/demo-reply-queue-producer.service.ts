import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { AMQP_CONNECTION } from 'src/amqp/amqp.constants';

@Injectable()
export class DemoReplyQueueProducer implements OnModuleInit {
  private readonly logger = new Logger(DemoReplyQueueProducer.name);

  private queue = 'DEMO.REPLY.QUEUE';
  private channelWrapper: amqp.ChannelWrapper;

  constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: amqp.AmqpConnectionManager,
  ) {
    this.channelWrapper = this.connectionManager.createChannel({
      json: true,
      setup: channel => {
        return channel.assertQueue(this.queue);
      },
    });
  }

  async onModuleInit() {
    await this.channelWrapper.waitForConnect();
  }

  async send(message) {
    this.logger.log(`Send message: ${JSON.stringify(message)}`);
    await this.channelWrapper.sendToQueue(this.queue, message);
  }
}
