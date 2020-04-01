import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager'
import { OnModuleInit } from '@nestjs/common'
import { Message, ConfirmChannel } from 'amqplib'
import { ConsumeQueueOptions, RETRY_HEADERS } from '../interfaces/queue'
import { ConsumeExchangeOptions } from '../interfaces/exchange'

export class ExchangeConsumer implements OnModuleInit {
  private $channel: ChannelWrapper
  private $handler: (content, consumeOptions?) => {}
  private $context

  constructor(
    readonly connection: AmqpConnectionManager,
    readonly exchangeOptions: ConsumeExchangeOptions,
    readonly queueOptions?: ConsumeQueueOptions
  ) {}

  async onModuleInit() {
    this.$channel = this.connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.prefetch(this.queueOptions ? this.queueOptions.prefetch : 1)
        let assertExchange
        try {
          assertExchange = await channel.assertExchange(
            this.exchangeOptions.name,
            this.exchangeOptions.type,
            this.exchangeOptions.options
          )
        } catch (error) {
          console.log(error)
        }
        const assertQueue = await channel.assertQueue('', this.queueOptions)
        await channel.bindQueue(assertQueue.queue, assertExchange.exchange, this.exchangeOptions.routingKey)
        await channel.consume(assertQueue.queue, (message) => {
          const content = JSON.parse(message.content.toString())
          this.handle(content)
            .then(() => {
              channel.ack(message)
            })
            .catch((error) => {
              this.requeue(message, error)
              channel.ack(message)
            })
        })
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
    const maxAttempts = (this.queueOptions && this.queueOptions.maxAttempts) || 0
    const retryAttempted = message.properties.headers[RETRY_HEADERS.RETRY_ATTEMPTED] || 0
    const canRetry = maxAttempts > 0 && retryAttempted < maxAttempts

    const content = JSON.parse(message.content.toString())

    if (canRetry) {
      const requeueHeaders = {
        [RETRY_HEADERS.RETRY_ATTEMPTED]: retryAttempted + 1,
      }
      await this.$channel.sendToQueue(this.exchangeOptions.name, content, {
        headers: requeueHeaders,
      })
    } else if (this.queueOptions && this.queueOptions.exceptionQueue) {
      await this.$channel.sendToQueue(this.queueOptions.exceptionQueue, {
        content: content,
        error: error.toString(),
      })
    }
  }
}
