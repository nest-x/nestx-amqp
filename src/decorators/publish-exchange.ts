import {
  PUBLISH_EXCHANGE_CONTEXT_METADATA_TOKEN,
  PUBLISH_EXCHANGE_METADATA_TOKEN,
  PUBLISH_EXCHANGE_OPTIONS_METADATA_TOKEN,
  PUBLISH_EXCHANGE_PRODUCER_METADATA_TOKEN,
} from '../amqp.constants'
import { createOrGetExchange, Exchange, PublishExchangeOptions } from '../interfaces/exchange'
import { ExchangeProducer } from '../services/exchange-producer'

export function PublishExchange(exchange: string, options?: PublishExchangeOptions): MethodDecorator
export function PublishExchange(exchange: Exchange, options?: PublishExchangeOptions): MethodDecorator
export function PublishExchange(nameOrExchange: string | Exchange, options?: PublishExchangeOptions): MethodDecorator {
  const exchange = createOrGetExchange(nameOrExchange)

  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalHandler = descriptor.value
    descriptor.value = async (content, ...elseArgs) => {
      const context = Reflect.getMetadata(PUBLISH_EXCHANGE_CONTEXT_METADATA_TOKEN, descriptor.value)
      const producer: ExchangeProducer = Reflect.getMetadata(PUBLISH_EXCHANGE_PRODUCER_METADATA_TOKEN, descriptor.value)

      if (options && options.always && producer) {
        await producer.send(content, options)
      }
      const result = originalHandler.call(context, content, ...elseArgs)
      if (!options || !options.always) {
        if (producer) {
          await producer.send(content, options)
        }
      }
      return result
    }

    Reflect.defineMetadata(PUBLISH_EXCHANGE_METADATA_TOKEN, exchange, descriptor.value)
    Reflect.defineMetadata(PUBLISH_EXCHANGE_OPTIONS_METADATA_TOKEN, options, descriptor.value)

    return descriptor
  }
}
