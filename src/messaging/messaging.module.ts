import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { DemoQueueProducer } from './demo-queue-producer.service';
import { DemoQueueConsumer } from './demo-queue-consumer.service';
import { DemoReplyQueueProducer } from './demo-reply-queue-producer.service';

@Module({
  providers: [
    DemoQueueProducer,
    DemoQueueConsumer,
    DemoReplyQueueProducer,
    MessagingService,
  ],
})
export class MessagingModule {}
