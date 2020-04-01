import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager'
import { OnModuleInit } from '@nestjs/common'
import { Message, Options } from 'amqplib'
import { ConsumeQueueOptions, Queue, RETRY_HEADERS } from '../interfaces/queue'

export class QueueConsumer implements OnModuleInit {
  private $channel: ChannelWrapper
  private $handler: (content, consumeOptions?) => {}
  private $context

  constructor(
    readonly connection: AmqpConnectionManager,
    readonly queue: Queue,
    readonly options?: ConsumeQueueOptions
  ) {}

  async onModuleInit() {
    this.$channel = this.connection.createChannel({
      json: true,
      setup: (channel) => {
        return Promise.all([
          channel.assertQueue(this.queue.name, this.queue.options),
          channel.prefetch(this.options ? this.options.prefetch : 1),
          channel.consume(this.queue.name, (message) => {
            const content = JSON.parse(message.content.toString())
            this.handle(content)
              .then(() => {
                channel.ack(message)
              })
              .catch((error) => {
                this.requeue(message, error)
                channel.ack(message)
              })
          }),
        ])
      },
    })
    await this.$channel.waitForConnect()
  }

  async listen() {
    await this.onModuleInit()
  }

  async applyHandler(handler: (content) => {}) {
    this.$handler = handler
  }

  async applyContext(context) {
    this.$context = context
  }

  private async handle(content) {
    const handleFn = this.$handler
    const handlerContext = this.$context
    return handleFn.call(handlerContext, content)
  }

  private async requeue(message: Message, error) {
    /* check if can retry? */
    const maxAttempts = this.options.maxAttempts || 0
    const retryAttempted = message.properties.headers[RETRY_HEADERS.RETRY_ATTEMPTED] || 0
    const canRetry = maxAttempts > 0 && retryAttempted < maxAttempts

    const content = JSON.parse(message.content.toString())

    if (canRetry) {
      const requeueHeaders = {
        [RETRY_HEADERS.RETRY_ATTEMPTED]: retryAttempted + 1,
      }
      await this.$channel.sendToQueue(this.queue.name, content, {
        headers: requeueHeaders,
      })
    } else if (this.options.exceptionQueue) {
      await this.$channel.sendToQueue(this.options.exceptionQueue, {
        content: content,
        error: error.toString(),
      })
    }
  }
}
