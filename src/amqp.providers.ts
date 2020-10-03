import { connect } from 'amqp-connection-manager';
import { AmqpConnectionManager } from 'amqp-connection-manager';
import { AMQPContainer } from './amqp.container';
import { AMQPAsyncConnectionOptions, AMQPConnectionOptions, AMQPConnectionOptionsFactory } from './amqp.options';
import { AMQP_CONNECTION, AMQP_CONNECTION_OPTIONS } from './amqp.constants';
import { FactoryProvider, Type } from '@nestjs/common';
import { getAMQPConnectionOptionsToken, getAMQPConnectionToken } from './shared/token.util';

export type ConnectionFactoryProvider = FactoryProvider<AmqpConnectionManager | Promise<AmqpConnectionManager>>;
export type ConnectionOptionsFactoryProvider = FactoryProvider<AMQPConnectionOptions | Promise<AMQPConnectionOptions>>;

export const createAMQPConnection = (name: string): ConnectionFactoryProvider => ({
  provide: getAMQPConnectionToken(name),
  inject: [getAMQPConnectionOptionsToken(name)],
  useFactory: async (args: AMQPConnectionOptions): Promise<AmqpConnectionManager> => {
    /* use name as key to get connection instance? */
    const connection = connect(args.urls, args.options);
    AMQPContainer.getInstance().set(name, connection);
    return connection;
  }
});

export const createAsyncAMQPConnectionOptions = (
  options: AMQPAsyncConnectionOptions
): ConnectionOptionsFactoryProvider => {
  /* default using uniq symbol `AMQP_CONNECTION_OPTIONS` symbol as token */
  if (options.useFactory) {
    return {
      provide: getAMQPConnectionOptionsToken(options.name),
      inject: options.inject,
      useFactory: options.useFactory
    };
  }

  const inject = [(options.useClass || options.useExisting) as Type<AMQPConnectionOptionsFactory>];

  return {
    provide: getAMQPConnectionOptionsToken(options.name),
    inject: inject,
    useFactory: async (connectionOptionsFactory: AMQPConnectionOptionsFactory) => {
      return connectionOptionsFactory.createAMQPConnectionOptions();
    }
  };
};
