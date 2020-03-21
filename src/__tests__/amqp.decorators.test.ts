import { Test, TestingModule } from '@nestjs/testing'
import { Injectable } from '@nestjs/common'
import { AMQPModule } from '../amqp.module'
import { AMQP_TEST_URLS } from '../__tests__/__fixtures__/amqp.test.fixtures'
import { PublishQueue } from '../decorators/publish'

describe('AMQP Decorators', () => {
  it('# should queue decorator works', async done => {
    @Injectable()
    class TestMessageService {
      @PublishQueue('TEST.QUEUE')
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
    await service.testPublishQueue({ id: `test-publish-queue-${Date.now()}` })

    await app.close()
    done()
  })
})
