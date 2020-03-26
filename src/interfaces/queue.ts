import { Options } from 'amqplib'

/**
 * @desc simply wrap amqp queue definitions as interface
 * */
export interface Queue {
  name: string
  options?: Options.AssertQueue
}

export interface PublishQueueOptions {
  queue: Queue | string
  options?: Options.Publish
}

export interface ConsumeQueueOptions {
  queue: Queue | string
  options?: Options.Consume
}
