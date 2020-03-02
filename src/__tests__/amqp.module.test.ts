import * as proxyquire from 'proxyquire';
import { FakeAMQP } from './__fixtures__/fake-amqplib';
import { Test, TestingModule } from '@nestjs/testing';
import { AMQPModule } from '../amqp.module';

const amqplib = new FakeAMQP();
proxyquire('amqp-connection-manager', {
  amqplib: amqplib
});

describe('AMQP Module', () => {
  it('# should module define with sync connection options correctly', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: ['amqp://devuser:devuser@localhost:5673']
        })
      ]
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const amqpModule = module.get(AMQPModule);

    expect(amqpModule).toBeInstanceOf(AMQPModule);

    await app.close();
  });

  it('# should module define with async connection options correctly', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.forRootAsync({
          useFactory: () => ({
            urls: ['amqp://devuser:devuser@localhost:5672']
          })
        })
      ]
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const amqpModule = module.get(AMQPModule);

    expect(amqpModule).toBeInstanceOf(AMQPModule);

    await app.close();
  });
});
