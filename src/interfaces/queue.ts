import { Options } from 'amqplib'

/**
 * @desc simply wrap amqp queue definitions as interface
 * */
export interface Queue {
  name: string
  options?: Options.AssertQueue
}

export type PublishQueueOptions = Options.Publish

export interface ConsumeQueueOptions {
  queue: Queue | string
  options?: Options.Consume
}

export const createOrGetQueue = (nameOrQueue: string | Queue): Queue => {
  if (typeof nameOrQueue === 'string') {
    return {
      name: nameOrQueue,
    }
  }

  return nameOrQueue as Queue
}
