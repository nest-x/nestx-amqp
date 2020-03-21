import * as amqp from 'amqp-connection-manager'
import { Options } from 'amqplib'
import { Inject, SetMetadata } from '@nestjs/common'
import {
  AMQP_CONNECTION,
  PUBLISH_QUEUE_METADATA_TOKEN,
  PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN,
  PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN
} from '../amqp.constants'
import { Producer } from '../services/producer'

export const PublishQueue = (name: string, options?: Options.AssertQueue): MethodDecorator => {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalHandler = descriptor.value
    descriptor.value = async (content, options?) => {
      const producer: Producer = Reflect.getMetadata(PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN, descriptor.value)
      if (producer) {
        await producer.send(content, options)
        originalHandler(content, options)
      }
    }

    Reflect.defineMetadata(PUBLISH_QUEUE_METADATA_TOKEN, name, descriptor.value)
    Reflect.defineMetadata(PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN, options, descriptor.value)

    return descriptor
  }
}
