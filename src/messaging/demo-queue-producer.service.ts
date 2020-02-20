import { Injectable } from '@nestjs/common';
import { SimpleAbstractProducer } from '../amqp/shared/simple.abstract.producer';

@Injectable()
export class DemoQueueProducer extends SimpleAbstractProducer {
  queue = 'DEMO.QUEUE';
  queueOptions = {};
}
