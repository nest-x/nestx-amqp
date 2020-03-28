import { Options } from 'amqplib'

/**
 * @desc simply wrap amqp exchange definitions as interface
 * */
export interface Exchange {
  name: string
  type: string | 'direct' | 'fanout' | 'topic' | 'headers'
  options?: Options.AssertExchange
}

/**
 * @desc wrap amqp.Channel.publish(exchange: string, routingKey: string, content, options?: Publish): boolean
 *       as interface
 * */
export interface PublishExchangeOptions {
  routingKey: string
  options?: Options.Publish
}

export const createOrGetExchange = (nameOrExchange: string | Exchange): Exchange => {
  if (typeof nameOrExchange === 'string') {
    return {
      name: nameOrExchange,
      type: 'direct',
    }
  }

  return nameOrExchange as Exchange
}
