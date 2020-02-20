import * as amqp from 'amqp-connection-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AMQP_CONNECTION } from '../amqp/amqp.constants';
import { DemoQueueProducer } from './demo-queue-producer.service';

@Injectable()
export class MessagingService implements OnModuleInit {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: amqp.AmqpConnectionManager,
    readonly demoQueueProducer: DemoQueueProducer,
  ) {}

  async onModuleInit() {
    this.logger.log(`Should initial at the end`);

    await this.demoQueueProducer.send(
      {
        hello: 'hi2',
      },
      {
        headers: {
          'x-max-retries': 3,
          'x-retry-attempted': 0,
        },
      },
    );
  }
}
