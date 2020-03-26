import { Options } from 'amqplib'

/**
 * @desc simply wrap amqp exchange definitions as interface
 * */
export interface Exchange {
  name: string
  options: Options.AssertExchange
}

/**
 * @desc wrap amqp.Channel.publish(exchange: string, routingKey: string, content, options?: Publish): boolean
 *       as interface
 * */
export interface PublishExchangeOptions  {
  exchange: Exchange | string
  routingKey: string
  options?: Options.Publish
}
