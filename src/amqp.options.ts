import { AmqpConnectionManagerOptions } from 'amqp-connection-manager'
import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common/interfaces'

export type AMQPConnectURLString = string


/**
 * @desc provide a factory when you can map your amqp connection as part of
 *       application
 * */
export interface AMQPConnectionOptionsFactory {
  createAMQPConnectionOptions(): AMQPConnectionOptions | Promise<AMQPConnectionOptions>
}

export interface AMQPConnectionOptions {
  name?: string
  urls: AMQPConnectURLString[]
  options?: AmqpConnectionManagerOptions
}

export interface AMQPAsyncConnectionOptions extends Pick<ModuleMetadata, 'imports'> {
  name?: string
  inject?: FactoryProvider['inject']
  useExisting?: Type<AMQPConnectionOptionsFactory>
  useClass?: Type<AMQPConnectionOptionsFactory>
  useFactory?: (...args: any[]) => AMQPConnectionOptions | Promise<AMQPConnectionOptions>
}
