import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing'
import { AMQPMetadataAccessor } from '../amqp-metadata.accessor';
import { AMQPModule } from '../amqp.module'
import { PublishQueue } from '../decorators/publish-queue'
import { AMQP_TEST_URLS } from './__fixtures__/amqp.test.fixtures'

describe('AMQP Decorators', () => {
  it('# should use decorator like bull module', async (done) => {
    @Injectable()
    class TestPublishQueueService {
      @PublishQueue('TEST.QUEUE')
      async testPublishQueue(content) {}
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: AMQP_TEST_URLS,
        }),
      ],
      providers:[
        TestPublishQueueService
      ]
    }).compile()
    let metadataAccessor: AMQPMetadataAccessor = new AMQPMetadataAccessor(new Reflector());
    const app = module.createNestApplication()
    await app.init()

    const service = app.get(TestPublishQueueService)

    expect(metadataAccessor.isPublishQueue(service.testPublishQueue)).toBeTruthy()


    await app.close()
    done()
  })
})
