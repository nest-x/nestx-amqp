import { Test, TestingModule } from '@nestjs/testing';
import { AMQP_TEST_URLS } from '../__tests__/__fixtures__/amqp.test.fixtures';
import { AMQPModule } from '../amqp.module';

describe('AMQP Module', () => {
  it('# should module define with sync connection options correctly', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS
        })
      ]
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const amqpModule = module.get(AMQPModule);

    expect(amqpModule).toBeInstanceOf(AMQPModule);

    await app.close();
    done();
  });

  it('# should module define with async connection options correctly', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.forRootAsync({
          useFactory: () => ({
            urls: AMQP_TEST_URLS
          })
        })
      ]
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const amqpModule = module.get(AMQPModule);

    expect(amqpModule).toBeInstanceOf(AMQPModule);

    await app.close();
    done();
  });
});
