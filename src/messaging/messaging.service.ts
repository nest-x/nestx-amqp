import * as amqp from 'amqp-connection-manager';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AMQP_CONNECTION } from '../amqp/amqp.constants';

const MESSAGING_QUEUE = `DEMO.QUEUE`;

/**
 * @desc message sample
 *       send message
 *       handle message
 * */
@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: amqp.AmqpConnectionManager,
  ) {
    this.logger.log(
      `AMQPConnectionManager status: ${connectionManager.isConnected()}`,
    );
  }

  async onModuleInit() {
    const channelWrapper = await this.connectionManager.createChannel({
      json: true,
      setup: channel => {
        return channel.assertQueue(MESSAGING_QUEUE);
      },
    });

    const helloMessage = {
      id: Math.random(),
      data: 'hello',
    };

    await channelWrapper.sendToQueue(MESSAGING_QUEUE, helloMessage);

    this.logger.log(
      `AMQPConnectionManager status: ${this.connectionManager.isConnected()}`,
    );
  }

  async onModuleDestroy() {
    await this.connectionManager.close();
    this.logger.log(`Close connection when receive TERM signal`);
  }
}
