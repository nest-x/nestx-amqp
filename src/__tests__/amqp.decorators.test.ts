import { Test, TestingModule } from '@nestjs/testing'
import { Inject, Injectable } from '@nestjs/common'
import { AMQPModule } from '../amqp.module'
import { AMQP_CONNECTION } from '../amqp.constants'

describe('AMQP Decorators', () => {
  it('# should queue decorator works', async () => {
    @Injectable()
    class TestMessageService {

    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.register({
          urls: ['amqp://devuser:devuser@localhost:5673']
        })
      ]
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    await app.close()
  })
})
