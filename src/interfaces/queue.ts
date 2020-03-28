import { Options } from 'amqplib'
import { RetryOptions } from './common';

/**
 * @desc simply wrap amqp queue definitions as interface
 * */
export interface Queue {
  name: string
  options?: Options.AssertQueue
}

export const RETRY_HEADERS = {
  RETRY_ATTEMPTED: 'x-retry-attempted',
}

export interface BaseConsumeOptions {
  prefetch: number
  exceptionQueue?: string
}

export type PublishQueueOptions = Options.Publish
export type ConsumeQueueOptions = BaseConsumeOptions & Partial<RetryOptions> & Options.Consume

export const createOrGetQueue = (nameOrQueue: string | Queue): Queue => {
  if (typeof nameOrQueue === 'string') {
    return {
      name: nameOrQueue,
    }
  }

  return nameOrQueue as Queue
}
