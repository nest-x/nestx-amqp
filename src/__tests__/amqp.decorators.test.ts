import { Test, TestingModule } from '@nestjs/testing'
import { Injectable } from '@nestjs/common'
import { Options } from 'amqplib'
import {
  ConsumeOptions,
  SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_OPTIONS_METADATA_TOKEN
} from '..'
import { AMQP_TEST_URLS } from '../__tests__/__fixtures__/amqp.test.fixtures'
import { PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN } from '../amqp.constants'
import { AMQPModule } from '../amqp.module'
import { PublishQueue } from '../decorators/publish'
import { SubscribeQueue } from '../decorators/subscribe'
import { wait } from './__fixtures__/shared.utils'

describe('AMQP Decorators', () => {
  it('# should queue decorators works', async done => {
    const queue = 'TEST.QUEUE'

    @Injectable()
    class TestMessageService {
      @PublishQueue(queue)
      async testPublishQueue(content, options?) {}

      @SubscribeQueue(queue)
      async testSubscribeQueue(content) {}
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS
        })
      ],
      providers: [TestMessageService]
    }).compile()

    const app = module.createNestApplication()
    await app.init()
    const service = app.get(TestMessageService)
    await service.testPublishQueue({ id: `test-publish-queue-${Date.now()}` })

    await app.close()
    done()
  })

  it('# publish queue options', async done => {
    const queue = 'TEST.QUEUE.WITH.OPTIONS'
    const queueOptions: Options.AssertQueue = {
      maxPriority: 10
    }

    @Injectable()
    class TestMessageService {
      @PublishQueue(queue, queueOptions)
      async testPublishQueue(content, options?) {}
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS
        })
      ],
      providers: [TestMessageService]
    }).compile()

    const app = module.createNestApplication()
    await app.init()
    const service = app.get(TestMessageService)
    await service.testPublishQueue({ id: `test-publish-queue-with-options-${Date.now()}` })

    expect(Reflect.getMetadata(PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN, service.testPublishQueue)).toBeDefined()
    expect(Reflect.getMetadata(PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN, service.testPublishQueue)).toEqual(queueOptions)

    await app.close()
    done()
  })

  it('# consume queue options', async done => {
    const queue = 'TEST.REPLY.QUEUE.WITH.OPTIONS'
    const queueOptions: Options.AssertQueue = {
      maxPriority: 9
    }
    const consumeOptions: ConsumeOptions = {
      prefetch: 1
    }

    @Injectable()
    class TestMessageService {
      @SubscribeQueue(queue, queueOptions, consumeOptions)
      async testSubscribeQueue(content) {}
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS
        })
      ],
      providers: [TestMessageService]
    }).compile()

    const app = module.createNestApplication()
    await app.init()
    const service = app.get(TestMessageService)

    expect(Reflect.getMetadata(SUBSCRIBE_QUEUE_METADATA_TOKEN, service.testSubscribeQueue)).toBeDefined()
    expect(Reflect.getMetadata(SUBSCRIBE_QUEUE_OPTIONS_METADATA_TOKEN, service.testSubscribeQueue)).toEqual(
      queueOptions
    )
    expect(Reflect.getMetadata(SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN, service.testSubscribeQueue)).toEqual(
      consumeOptions
    )

    await app.close()
    done()
  })

  it('# crossover - calling producer function in subscribe handler', async done => {
    const queue = 'TEST.QUEUE'
    const replyQueue = 'TEST.REPLY.QUEUE'

    @Injectable()
    class TestMessageService {
      @PublishQueue(queue)
      async testPublishQueue(content, options?) {}

      @PublishQueue(replyQueue)
      async testPublishReplyQueue(content) {}

      @SubscribeQueue(queue)
      async testSubscribeQueue(content) {
        const replyContent = {
          ...content,
          completed: true
        }

        await this.testPublishReplyQueue(replyContent)
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS
        })
      ],
      providers: [TestMessageService]
    }).compile()

    const app = module.createNestApplication()
    await app.init()
    const service = app.get(TestMessageService)
    await service.testPublishQueue({ id: `test-publish-queue-${Date.now()}` })

    // sleep for consume

    await wait(2000)
    await app.close()
    done()
  })

  it('# should consumeOptions#retry/retryAttempted logic works', async done => {
    const queue = 'TEST.QUEUE'
    const replyQueue = 'TEST.REPLY.QUEUE'
    const exceptionQueue = 'TEST.EXCEPTION.QUEUE'

    const queueOptions = undefined
    const consumeOptions: ConsumeOptions = {
      prefetch: 1,
      maxAttempts: 3,
      exceptionQueue: exceptionQueue
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

      @SubscribeQueue(queue, queueOptions, consumeOptions)
      async testSubscribeQueue(content) {
        // sorry it always throws when content.id is undefined
        if (!content.id) {
          throw Error('no id in content')
        }

        this.testPublishReplyQueue({
          ...content,
          completed: true
        })
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS
        })
      ],
      providers: [TestMessageService]
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
})
