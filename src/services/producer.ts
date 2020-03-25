import * as amqp from 'amqp-connection-manager'
import { OnModuleInit } from '@nestjs/common'
import { Options } from 'amqplib'

export class Producer implements OnModuleInit {
  private $channel: amqp.ChannelWrapper

  constructor(
    readonly connection: amqp.AmqpConnectionManager,
    readonly queue: string,
    readonly queueOptions?: Options.AssertQueue
  ) {}

  async onModuleInit() {
    this.$channel = this.connection.createChannel({
      json: true,
      setup: (channel) => {
        return channel.assertQueue(this.queue, this.queueOptions)
      },
    })
    await this.$channel.waitForConnect()
  }

  async send(message, options?: Options.Publish) {
    await this.$channel.sendToQueue(this.queue, message, options)
  }
}
