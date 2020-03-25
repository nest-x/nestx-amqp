import { Options } from 'amqplib'
import {
  PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN,
  PUBLISH_QUEUE_METADATA_TOKEN,
  PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN,
  PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN,
} from '../amqp.constants'
import { Producer } from '../services/producer'

export function PublishQueue(queue: string, options?: Options.AssertQueue): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalHandler = descriptor.value
    descriptor.value = async (content, options?) => {
      const context = Reflect.getMetadata(PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN, descriptor.value)
      const producer: Producer = Reflect.getMetadata(PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN, descriptor.value)
      if (producer) {
        await producer.send(content, options)
      }
      await originalHandler.call(context, content, options)
    }

    Reflect.defineMetadata(PUBLISH_QUEUE_METADATA_TOKEN, queue, descriptor.value)
    Reflect.defineMetadata(PUBLISH_QUEUE_OPTIONS_METADATA_TOKEN, options, descriptor.value)

    return descriptor
  }
}
