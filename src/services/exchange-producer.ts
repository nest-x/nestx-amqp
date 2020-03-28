import { OnModuleInit } from '@nestjs/common'
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager'
import { Exchange, PublishExchangeOptions } from '../interfaces/exchange'

const isDefaultExchangeName = (name: string) => {
  return name === ''
}

export class ExchangeProducer implements OnModuleInit {
  private $channel: ChannelWrapper

  constructor(readonly connection: AmqpConnectionManager, readonly exchange: Exchange) {}

  async onModuleInit() {
    this.$channel = this.connection.createChannel({
      json: true,
      setup: (channel) => {
        return isDefaultExchangeName(this.exchange.name)
          ? Promise.resolve()
          : channel.assertExchange(this.exchange.name, this.exchange.type, this.exchange.options)
      },
    })
    await this.$channel.waitForConnect()
  }

  async send(content, options?: PublishExchangeOptions) {
    const routingKey = options ? options.routingKey : ''
    const publishOptions = options ? options.options : undefined

    await this.$channel.publish(this.exchange.name, routingKey, content, publishOptions)
  }
}
