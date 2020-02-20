import * as amqp from 'amqp-connection-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Message } from 'amqplib';
import { AMQP_CONNECTION } from '../amqp/amqp.constants';
import { DemoReplyQueueProducer } from './demo-reply-queue-producer.service';
import { DemoQueueProducer } from './demo-queue-producer.service';
import { SimpleAbstractConsumer } from '../amqp/shared/simple.abstract.consumer';

@Injectable()
export class DemoQueueConsumer extends SimpleAbstractConsumer {
  private readonly logger = new Logger(DemoQueueConsumer.name);

  constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: amqp.AmqpConnectionManager,
    readonly demoQueueProducer: DemoQueueProducer,
    readonly demoReplyQueueProducer: DemoReplyQueueProducer,
  ) {
    super(connectionManager);
  }

  queue = 'DEMO.QUEUE';
  queueOptions = {};
  prefetch = 1;

  async handle(content) {
    this.logger.log(`Handling message: ${JSON.stringify(content)}`);
    await this.demoReplyQueueProducer.send(content);
  }

  async requeue(message: Message) {
    this.logger.warn(`Requeue message: ${message.content.toString()}`);
  }

  async drop(message: Message) {
    this.logger.error(`Drop message: ${message.content.toString()}`);
  }
}
