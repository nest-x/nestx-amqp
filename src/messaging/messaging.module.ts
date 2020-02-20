import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Module({
  providers: [MessagingService],
})
export class MessagingModule {}
