import * as amqp from 'amqp-connection-manager'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { Options } from 'amqplib'
import { AMQP_CONNECTION } from '../amqp.constants'

@Injectable()
export class Producer implements OnModuleInit {
  $channel: amqp.ChannelWrapper

  queue: string
  queueOptions: Options.AssertQueue

  constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: amqp.AmqpConnectionManager
  ) {}

  async onModuleInit() {
    this.$channel = this.connectionManager.createChannel({
      json: true,
      setup: channel => {
        return channel.assertQueue(this.queue, this.queueOptions)
      }
    })
    await this.$channel.waitForConnect()
  }

  async send(message, options?: Options.Publish) {
    await this.$channel.sendToQueue(this.queue, message, options)
  }
}
