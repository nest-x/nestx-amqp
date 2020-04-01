import {
  SUBSCRIBE_EXCHANGE_OPTIONS_METADATA_TOKEN,
  SUBSCRIBE_EXCHANGE_QUEUE_OPTIONS_METADATA_TOKEN,
} from '../amqp.constants'
import { ConsumeQueueOptions } from '../interfaces/queue'
import { ConsumeExchangeOptions } from '../interfaces/exchange'

export function SubscribeExchange(
  exchangeOptions: ConsumeExchangeOptions,
  quequeOptions?: ConsumeQueueOptions
): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    // Reflect.defineMetadata(SUBSCRIBE_EXCHANGE_METADATA_TOKEN, exchange, descriptor.value)
    Reflect.defineMetadata(SUBSCRIBE_EXCHANGE_OPTIONS_METADATA_TOKEN, exchangeOptions, descriptor.value)
    Reflect.defineMetadata(SUBSCRIBE_EXCHANGE_QUEUE_OPTIONS_METADATA_TOKEN, quequeOptions, descriptor.value)
    return descriptor
  }
}
