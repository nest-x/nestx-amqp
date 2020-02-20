import { Module } from '@nestjs/common';
import { AMQPModule } from './amqp/amqp.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    MessagingModule,
    AMQPModule.forRootAsync({
      useFactory: () => ({
        urls: ['amqp://devuser:devuser@localhost:5672?heartbeat=60'],
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
