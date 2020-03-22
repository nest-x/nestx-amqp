import * as amqp from 'amqp-connection-manager'
import { OnModuleInit } from '@nestjs/common'
import { Message, Options } from 'amqplib'

export const RETRY_HEADERS = {
  RETRY_ATTEMPTED: 'x-retry-attempted'
}

export interface RetryOptions {
  maxAttempts: number
}

export interface BaseConsumeOptions {
  prefetch: number
  exceptionQueue?: string
}

export type ConsumeOptions = BaseConsumeOptions & Partial<RetryOptions>

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

  private async requeue(message: Message, error) {
    // check if can retry?
    const maxAttempts = this.consumeOptions.maxAttempts || 0
    const retryAttempted = message.properties.headers[RETRY_HEADERS.RETRY_ATTEMPTED] || 0
    const canRetry = maxAttempts > 0 && retryAttempted < maxAttempts

    const content = JSON.parse(message.content.toString())

    if (canRetry) {
      const requeueHeaders = {
        [RETRY_HEADERS.RETRY_ATTEMPTED]: retryAttempted + 1
      }
      await this.$channel.sendToQueue(this.queue, content, { headers: requeueHeaders })
    } else if (this.consumeOptions.exceptionQueue) {
      await this.$channel.sendToQueue(this.consumeOptions.exceptionQueue, content)
    }
  }
}
