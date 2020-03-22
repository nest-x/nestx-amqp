import * as amqp from 'amqp-connection-manager'
import { OnModuleInit } from '@nestjs/common'
import { Options } from 'amqplib'

export interface ConsumeOptions {
  prefetch: number
}

export class Consumer implements OnModuleInit {
  private $channel: amqp.ChannelWrapper
  private $handler: (content, consumeOptions?) => {}
  private $handlerContext

  constructor(
    readonly connection: amqp.AmqpConnectionManager,
    readonly queue: string,
    readonly queueOptions?: Options.AssertQueue,
    readonly consumeOptions?: ConsumeOptions
  ) {}

  async onModuleInit() {
    this.$channel = this.connection.createChannel({
      json: true,
      setup: channel => {
        return Promise.all([
          channel.assertQueue(this.queue, this.queueOptions),
          channel.prefetch(this.consumeOptions ? this.consumeOptions.prefetch : 1),
          channel.consume(this.queue, message => {
            const content = JSON.parse(message.content.toString())
            this.handle(content)
              .then(() => {
                channel.ack(message)
              })
              .catch(error => {
                this.requeue(message, error)
                channel.ack(message)
              })
          })
        ])
      }
    })
    await this.$channel.waitForConnect()
  }

  async listen() {
    await this.onModuleInit()
  }

  async applyHandler(handler: (content) => {}) {
    this.$handler = handler
  }

  async applyHandlerContext(context) {
    this.$handlerContext = context
  }

  private async handle(content) {
    const handleFn = this.$handler
    const handlerContext = this.$handlerContext
    return handleFn.call(handlerContext, content)
  }

  private async requeue(message, error) {

  }
}
