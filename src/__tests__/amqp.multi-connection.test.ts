import { Injectable } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AmqpConnectionManager } from 'amqp-connection-manager'
import { AMQP_TEST_URLS } from '../__tests__/__fixtures__/amqp.test.fixtures'
import { AMQPContainer } from '../amqp.container'
import { AMQPModule } from '../amqp.module'
import { InjectAMQPConnection } from '../decorators/inject-connection'

describe('AMQP Module: Multi Connections ', () => {
  it('# should module register default connection and named connection for 3rd-party libs', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS,
        }),
        AMQPModule.register({
          name: 'log4js',
          urls: AMQP_TEST_URLS,
        }),
      ],
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    const amqpModule = module.get(AMQPModule)
    expect(amqpModule).toBeInstanceOf(AMQPModule)
    expect(AMQPContainer.getInstance().size()).toEqual(2)

    await app.close()

    done()
  })

  it('# should module register default connection and named connection for 3rd-party libs async', async (done) => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.forRootAsync({
          useFactory: () => ({
            urls: AMQP_TEST_URLS,
          }),
        }),
        AMQPModule.forRootAsync({
          name: 'log4js',
          useFactory: () => ({
            urls: AMQP_TEST_URLS,
          }),
        }),
      ],
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    const amqpModule = module.get(AMQPModule)

    expect(amqpModule).toBeInstanceOf(AMQPModule)
    expect(AMQPContainer.getInstance().size()).toEqual(2)

    await app.close()
    done()
  })

  it('# should module register two connection and can used @InjectAMQPConnection(name) for use different connection', async (done) => {
    @Injectable()
    class TestingMessageService {
      constructor(
        @InjectAMQPConnection() public readonly connection: AmqpConnectionManager,
        @InjectAMQPConnection('log4js') public readonly logConnection: AmqpConnectionManager
      ) {}
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.forRootAsync({
          useFactory: () => ({
            urls: AMQP_TEST_URLS,
          }),
        }),
        AMQPModule.forRootAsync({
          name: 'log4js',
          useFactory: () => ({
            urls: AMQP_TEST_URLS,
          }),
        }),
      ],
      providers: [TestingMessageService],
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    const service = app.get(TestingMessageService)

    expect(service.connection === service.logConnection).toBeFalsy()
    expect(AMQPContainer.getInstance().size()).toEqual(2)

    await app.close()
    done()
  })
})
