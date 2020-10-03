import { AmqpConnectionManagerOptions } from 'amqp-connection-manager';
import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common/interfaces';

export type AmqpConnectURLString = string;

/**
 * @desc provide a factory when you can map your amqp connection as part of
 *       application
 * */
export interface AmqpConnectionOptionsFactory {
  createAMQPConnectionOptions(): AmqpConnectionOptions | Promise<AmqpConnectionOptions>;
}

export interface AmqpConnectionOptions {
  name?: string;
  urls: AmqpConnectURLString[];
  options?: AmqpConnectionManagerOptions;
}

export interface AmqpAsyncConnectionOptions extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  inject?: FactoryProvider['inject'];
  useExisting?: Type<AmqpConnectionOptionsFactory>;
  useClass?: Type<AmqpConnectionOptionsFactory>;
  useFactory?: (...args: any[]) => AmqpConnectionOptions | Promise<AmqpConnectionOptions>;
}
