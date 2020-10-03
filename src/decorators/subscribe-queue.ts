import { SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN, SUBSCRIBE_QUEUE_METADATA_TOKEN } from '../amqp.constants';
import { ConsumeQueueOptions, createOrGetQueue, Queue } from '../interfaces/queue';

export function SubscribeQueue(name: string, options?: ConsumeQueueOptions): MethodDecorator;
export function SubscribeQueue(queue: Queue, options?: ConsumeQueueOptions): MethodDecorator;
export function SubscribeQueue(nameOrQueue: string | Queue, options?: ConsumeQueueOptions): MethodDecorator {
  const queue = createOrGetQueue(nameOrQueue);

  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(SUBSCRIBE_QUEUE_METADATA_TOKEN, queue, descriptor.value);
    Reflect.defineMetadata(SUBSCRIBE_QUEUE_CONSUME_OPTIONS_METADATA_TOKEN, options, descriptor.value);
    return descriptor;
  };
}
