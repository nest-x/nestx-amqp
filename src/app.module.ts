import { Module } from '@nestjs/common';
import { AmqpModule } from './amqp/amqp.module';

@Module({
  imports: [AmqpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
