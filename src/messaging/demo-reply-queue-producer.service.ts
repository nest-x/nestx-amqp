import { Injectable } from '@nestjs/common';
import { SimpleAbstractProducer } from 'src/amqp/shared/simple.abstract.producer';

@Injectable()
export class DemoReplyQueueProducer extends SimpleAbstractProducer {
  queue = 'DEMO.REPLY.QUEUE';
  queueOptions = {};
}
