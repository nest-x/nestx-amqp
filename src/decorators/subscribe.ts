import { Options } from 'amqplib'
import {
  SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_METADATA_TOKEN,
  SUBSCRIBE_QUEUE_OPTIONS_METADATA_TOKEN,
} from '../amqp.constants'
import { ConsumeOptions } from '../services/consumer'

export function SubscribeQueue(
  queue: string,
  options?: Options.AssertQueue,
  consumeOptions?: ConsumeOptions
): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(SUBSCRIBE_QUEUE_METADATA_TOKEN, queue, descriptor.value)
    Reflect.defineMetadata(SUBSCRIBE_QUEUE_OPTIONS_METADATA_TOKEN, options, descriptor.value)
    Reflect.defineMetadata(SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN, consumeOptions, descriptor.value)

    return descriptor
  }
}
