import {
  PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN,
  PUBLISH_QUEUE_METADATA_TOKEN,
  PUBLISH_QUEUE_PRODUCE_OPTIONS_METADATA_TOKEN,
  PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN,
} from '../amqp.constants'
import { createOrGetQueue, PublishQueueOptions, Queue } from '../interfaces/queue'
import { QueueProducer } from '../services/queue-producer'

export function PublishQueue(name: string, options?: PublishQueueOptions): MethodDecorator
export function PublishQueue(queue: Queue, options?: PublishQueueOptions): MethodDecorator
export function PublishQueue(nameOrQueue: string | Queue, options?: PublishQueueOptions): MethodDecorator {
  const queue = createOrGetQueue(nameOrQueue)

  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalHandler = descriptor.value
    descriptor.value = async (content, ...elseArgs) => {
      const context = Reflect.getMetadata(PUBLISH_QUEUE_CONTEXT_METADATA_TOKEN, descriptor.value)
      const producer: QueueProducer = Reflect.getMetadata(PUBLISH_QUEUE_PRODUCER_METADATA_TOKEN, descriptor.value)

      if (options && options.always && producer) {
        await producer.send(content, options)
      }
      const result = originalHandler.call(context, content, ...elseArgs)
      if (result && typeof result.then === 'function') {
        return result.then(async (r) => {
          if (!options || !options.always) {
            if (producer) {
              await producer.send(content, options)
            }
          }
          return r
        })
      } else {
        if (!options || !options.always) {
          if (producer) {
            await producer.send(content, options)
          }
        }
      }
      return result
    }
    Reflect.defineMetadata(PUBLISH_QUEUE_METADATA_TOKEN, queue, descriptor.value)
    Reflect.defineMetadata(PUBLISH_QUEUE_PRODUCE_OPTIONS_METADATA_TOKEN, options, descriptor.value)

    return descriptor
  }
}
