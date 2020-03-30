import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { AMQP_CONNECTION, USE_AMQP_CONNECTION_TOKEN } from '../amqp.constants'
import { AMQPModule } from '../amqp.module'
import { UseAMQPConnection } from '../decorators/inject-connection'
import { PublishExchange } from '../decorators/publish-exchange'
import { PublishQueue } from '../decorators/publish-queue'
import { SubscribeQueue } from '../decorators/subscribe-queue'
import { ConsumeQueueOptions } from '../interfaces/queue'
import { AMQP_TEST_URLS } from './__fixtures__/amqp.test.fixtures'
import { wait } from './__fixtures__/shared.utils'

describe('AMQP Decorators', () => {
  it('# should use @PublishQueue decorator with default connection', async (done) => {
    const queue = 'TEST.QUEUE'

    @Injectable()
    class TestPublishQueueService {
      @PublishQueue(queue)
      async testPublishQueue(content) {}

      @SubscribeQueue(queue)
      async testSubscribeQueue(content) {}
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS,
        }),
      ],
      providers: [TestPublishQueueService],
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    const service = app.get(TestPublishQueueService)
    await service.testPublishQueue({ id: Date.now() })

    await wait(2000)
    await app.close()
    done()
  })

  it('# should use @PublishQueue decorator and keep return value', async (done) => {
    const queue = 'TEST.QUEUE.WITH.RETURN.VALUE'
    const returnValue = 2

    @Injectable()
    class TestPublishQueueService {
      @PublishQueue(queue)
      async testPublishQueue(content) {
        return returnValue
      }

      @SubscribeQueue(queue)
      async testSubscribeQueue(content) {}
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS,
        }),
      ],
      providers: [TestPublishQueueService],
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    const service = app.get(TestPublishQueueService)
    const result = await service.testPublishQueue({ id: Date.now() })

    expect(result).toEqual(returnValue)

    await wait(2000)
    await app.close()
    done()
  })

  it('# should use @PublishQueue with named connection', async (done) => {
    const queue = {
      name: 'TEST.QUEUE',
    }

    @Injectable()
    class TestPublishQueueService {
      @UseAMQPConnection('log4js')
      @PublishQueue(queue)
      async testPublishQueue(content) {}

      @UseAMQPConnection('log4js')
      @SubscribeQueue(queue)
      async testSubscribeQueue(content) {}
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          name: 'log4js',
          urls: AMQP_TEST_URLS,
        }),
      ],
      providers: [TestPublishQueueService],
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    const service = app.get(TestPublishQueueService)
    await service.testPublishQueue({ id: Date.now() })

    await wait(2000)
    await app.close()
    done()
  })

  it('# should use @PublishExchange decorator with default connection', async (done) => {
    const exchange = ''
    const routingKey = 'TEST.ROUTING.KEY'

    @Injectable()
    class TestPublishQueueService {
      public consumed = 0

      @PublishExchange(exchange, { routingKey })
      async testPublishExchange(content) {}

      @SubscribeQueue(routingKey)
      async testSubscribeQueue(content) {
        this.consumed++
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS,
        }),
      ],
      providers: [TestPublishQueueService],
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    const service = app.get(TestPublishQueueService)
    await service.testPublishExchange({ id: Date.now() })

    await wait(2000)
    expect(service.consumed).toEqual(1)
    await app.close()
    done()
  })

  it('# should use @SubscribeQueue decorator with default connection', async (done) => {
    @Injectable()
    class TestMessageService {
      public consumed = 0

      @PublishQueue('TEST.QUEUE.FOR.SUBSCRIBE')
      async testPublishQueue(content) {}

      @SubscribeQueue('TEST.QUEUE.FOR.SUBSCRIBE')
      async testSubscribeQueue(content) {
        this.consumed++
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS,
        }),
      ],
      providers: [TestMessageService],
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    const service: TestMessageService = app.get(TestMessageService)
    await service.testPublishQueue({ id: Date.now() })

    await wait(2000)
    expect(service.consumed).toEqual(1)

    await app.close()
    done()
  })

  it('# should call send function in subscribe handler works(context)', async (done) => {
    const queue = 'TEST.QUEUE.CROSSOVER'
    const replyQueue = 'TEST.REPLY.QUEUE'

    @Injectable()
    class TestMessageService {
      public replyCount = 0

      @PublishQueue(queue)
      async testPublishQueue(content, options?) {}

      @PublishQueue(replyQueue)
      async testPublishReplyQueue(content) {}

      @SubscribeQueue(queue)
      async testSubscribeQueue(content) {
        const replyContent = {
          ...content,
          completed: true,
        }

        await this.testPublishReplyQueue(replyContent)
      }

      @SubscribeQueue(replyQueue)
      async testSubscribeReplyQueue(content) {
        this.replyCount++
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS,
        }),
      ],
      providers: [TestMessageService],
    }).compile()

    const app = module.createNestApplication()
    await app.init()
    const service = app.get(TestMessageService)
    await service.testPublishQueue({ id: `test-publish-queue-${Date.now()}` })

    // sleep for consume
    await wait(2000)

    expect(service.replyCount).toEqual(1)
    await app.close()
    done()
  })

  it('# should consumeOptions#retry/retryAttempted logic works', async (done) => {
    const queue = 'TEST.QUEUE.WITH.RETRY'
    const replyQueue = 'TEST.REPLY.QUEUE.WITH.RETRY'
    const exceptionQueue = 'TEST.EXCEPTION.QUEUE'

    const consumeOptions: ConsumeQueueOptions = {
      prefetch: 1,
      maxAttempts: 3,
      exceptionQueue: exceptionQueue,
    }

    @Injectable()
    class TestMessageService {
      replyCount = 0
      exceptionCount = 0

      @PublishQueue(queue)
      async testPublishQueue(content, options?) {}

      @PublishQueue(replyQueue)
      async testPublishReplyQueue(content) {
        this.replyCount++
      }

      @SubscribeQueue(exceptionQueue)
      async testSubscribeExceptionQueue(content, error) {
        this.exceptionCount++
      }

      @SubscribeQueue(queue, consumeOptions)
      async testSubscribeQueue(content) {
        // sorry it always throws when content.id is undefined
        if (!content.id) {
          throw Error('no id in content')
        }

        this.testPublishReplyQueue({
          ...content,
          completed: true,
        })
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS,
        }),
      ],
      providers: [TestMessageService],
    }).compile()
    const app = module.createNestApplication()
    await app.init()
    const service = app.get(TestMessageService)

    const successContent = { id: 'success' }
    const failContent = {}

    await service.testPublishQueue(successContent)
    await service.testPublishQueue(failContent)

    await wait(2000)

    expect(service.replyCount).toEqual(1)
    expect(service.exceptionCount).toEqual(1)

    await app.close()
    done()
  })

  it('# should consumeOptions#retry/retryAttempted logic works without maxAttempted', async (done) => {
    const queue = 'TEST.QUEUE.WITH.RETRY'
    const replyQueue = 'TEST.REPLY.QUEUE.WITH.RETRY'
    const exceptionQueue = 'TEST.EXCEPTION.QUEUE'

    const consumeOptions: ConsumeQueueOptions = {
      prefetch: 1,
    }

    @Injectable()
    class TestMessageService {
      replyCount = 0
      exceptionCount = 0

      @PublishQueue(queue)
      async testPublishQueue(content, options?) {}

      @PublishQueue(replyQueue)
      async testPublishReplyQueue(content) {
        this.replyCount++
      }

      @SubscribeQueue(exceptionQueue)
      async testSubscribeExceptionQueue(content, error) {
        this.exceptionCount++
      }

      @SubscribeQueue(queue, consumeOptions)
      async testSubscribeQueue(content) {
        // sorry it always throws when content.id is undefined
        if (!content.id) {
          throw Error('no id in content')
        }

        this.testPublishReplyQueue({
          ...content,
          completed: true,
        })
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS,
        }),
      ],
      providers: [TestMessageService],
    }).compile()
    const app = module.createNestApplication()
    await app.init()
    const service = app.get(TestMessageService)

    const successContent = { id: 'success' }
    const failContent = {}

    await service.testPublishQueue(successContent)
    await service.testPublishQueue(failContent)

    await wait(2000)

    expect(service.replyCount).toEqual(1)
    expect(service.exceptionCount).toEqual(0)

    await app.close()
    done()
  })
})
