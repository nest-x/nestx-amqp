import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AmqpConnectionManager } from 'amqp-connection-manager';
import { AMQP_TEST_URLS } from './__fixtures__/amqp.test.fixtures';
import { AmqpContainer } from '../amqp.container';
import { AmqpModule } from '../amqp.module';
import { InjectAmqpConnection } from '../decorators/inject-connection';

describe('AMQP Module: Multi Connections ', () => {
  it('# should module register default connection and named connection for 3rd-party libs', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AmqpModule.register({
          urls: AMQP_TEST_URLS
        }),
        AmqpModule.register({
          name: 'log4js',
          urls: AMQP_TEST_URLS
        })
      ]
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const amqpModule = module.get(AmqpModule);
    expect(amqpModule).toBeInstanceOf(AmqpModule);
    expect(AmqpContainer.getInstance().size()).toEqual(2);

    await app.close();

    done();
  });

  it('# should module register default connection and named connection for 3rd-party libs async', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AmqpModule.forRootAsync({
          useFactory: () => ({
            urls: AMQP_TEST_URLS
          })
        }),
        AmqpModule.forRootAsync({
          name: 'log4js',
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
    expect(AmqpContainer.getInstance().size()).toEqual(2);

    await app.close();
    done();
  });

  it('# should module register two connection and can used @InjectAMQPConnection(name) for use different connection', async (done) => {
    @Injectable()
    class TestingMessageService {
      constructor(
        @InjectAmqpConnection() public readonly connection: AmqpConnectionManager,
        @InjectAmqpConnection('log4js') public readonly logConnection: AmqpConnectionManager
      ) {}
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AmqpModule.forRootAsync({
          useFactory: () => ({
            urls: AMQP_TEST_URLS
          })
        }),
        AmqpModule.forRootAsync({
          name: 'log4js',
          useFactory: () => ({
            urls: AMQP_TEST_URLS
          })
        })
      ],
      providers: [TestingMessageService]
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const service = app.get(TestingMessageService);

    expect(service.connection === service.logConnection).toBeFalsy();
    expect(AmqpContainer.getInstance().size()).toEqual(2);

    await app.close();
    done();
  });
});
