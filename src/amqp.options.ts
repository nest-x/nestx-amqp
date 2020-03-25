import { AmqpConnectionManagerOptions } from 'amqp-connection-manager'
import { ModuleMetadata } from '@nestjs/common/interfaces'

export type AMQPConnectURLString = string

export interface AMQPConnectionOptions {
  urls: AMQPConnectURLString[]
  options?: AmqpConnectionManagerOptions
}

export interface AMQPAsyncConnectionOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[]
  useFactory?: (...args) => AMQPConnectionOptions | Promise<AMQPConnectionOptions>
}
