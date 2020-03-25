import * as amqp from 'amqp-connection-manager'
import { AmqpConnectionManager } from 'amqp-connection-manager'
import { AMQPAsyncConnectionOptions, AMQPConnectionOptions } from './amqp.options'
import { AMQP_CONNECTION, AMQP_CONNECTION_OPTIONS } from './amqp.constants'
import { FactoryProvider } from '@nestjs/common'

export type ConnectionFactoryProvider = FactoryProvider<AmqpConnectionManager | Promise<AmqpConnectionManager>>
export type ConnectionOptionsFactoryProvider = FactoryProvider<AMQPConnectionOptions | Promise<AMQPConnectionOptions>>

export const createAMQPConnection = (): ConnectionFactoryProvider => ({
  provide: AMQP_CONNECTION,
  inject: [AMQP_CONNECTION_OPTIONS],
  useFactory: async (args: AMQPConnectionOptions): Promise<AmqpConnectionManager> => {
    return amqp.connect(args.urls, args.options)
  },
})

export const createAsyncAMQPConnectionOptions = (
  options: AMQPAsyncConnectionOptions
): ConnectionOptionsFactoryProvider => ({
  provide: AMQP_CONNECTION_OPTIONS,
  inject: options.inject,
  useFactory: options.useFactory,
})
