import { Test, TestingModule } from '@nestjs/testing';
import { AMQP_TEST_URLS } from '../__tests__/__fixtures__/amqp.test.fixtures';
import { AmqpModule } from '../amqp.module';

describe('Amqp Module', () => {
  it('# should module define with sync connection options correctly', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AmqpModule.register({
          urls: AMQP_TEST_URLS
        })
      ]
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const amqpModule = module.get(AmqpModule);

    expect(amqpModule).toBeInstanceOf(AmqpModule);

    await app.close();
    done();
  });

  it('# should module define with async connection options correctly', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AmqpModule.forRootAsync({
          useFactory: () => ({
            urls: AMQP_TEST_URLS
          })
        })
      ]
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const amqpModule = module.get(AmqpModule);

    expect(amqpModule).toBeInstanceOf(AmqpModule);

    await app.close();
    done();
  });
});
