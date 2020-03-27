import { Injectable, Type } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PUBLISH_QUEUE_METADATA_TOKEN } from './amqp.constants'

@Injectable()
export class AMQPMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isPublishQueue(target: Type<any> | Function): boolean {
    if (!target) {
      return false
    }

    const result = this.reflector.get(PUBLISH_QUEUE_METADATA_TOKEN, target)
    return !!result
  }
}
