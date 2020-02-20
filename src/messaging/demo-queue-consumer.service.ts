import * as amqp from 'amqp-connection-manager';
import { AMQP_CONNECTION } from '../amqp/amqp.constants';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DemoReplyQueueProducer } from './demo-reply-queue-producer.service';

@Injectable()
export class DemoQueueConsumer implements OnModuleInit {
  private readonly logger = new Logger(DemoQueueConsumer.name);

  private queue = 'DEMO.QUEUE';
  private channelWrapper: amqp.ChannelWrapper;

  constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: amqp.AmqpConnectionManager,
    readonly demoReplyQueueProducer: DemoReplyQueueProducer,
  ) {
    // CONSUME
    this.channelWrapper = this.connectionManager.createChannel({
      json: true,
      setup: channel => {
        return Promise.all([
          channel.assertQueue(this.queue),
          channel.prefetch(1),
          channel.consume(this.queue, message => {
            this.handle(JSON.parse(message.content.toString()))
              .then(() => {
                channel.ack(message);
              })
              .catch(error => {
                this.logger.error(`Consume error: ${error.message}`);
                this.requeue(message);
                channel.ack(message);
              });
          }),
        ]);
      },
    });
  }

  async onModuleInit() {
    await this.channelWrapper.waitForConnect();
  }

  /**
   * handle message content
   * */
  async handle(message) {
    this.logger.log(`Try consume message: ${JSON.stringify(message)}`);

    if (message['hello'] === 'hi2') {
      throw Error(`Consume Error when hello = hi2`);
    }

    await this.demoReplyQueueProducer.send(message);
  }

  async requeue(message) {
    this.logger.log(`Try to requeue message: ${JSON.stringify(message)}`);
  }
}
