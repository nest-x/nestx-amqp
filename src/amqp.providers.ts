import { connect } from 'amqp-connection-manager';
import { AmqpConnectionManager } from 'amqp-connection-manager';
import { AmqpContainer } from './amqp.container';
import { AmqpAsyncConnectionOptions, AmqpConnectionOptions, AmqpConnectionOptionsFactory } from './amqp.options';
import { FactoryProvider, Type } from '@nestjs/common';
import { getAmqpConnectionOptionsToken, getAmqpConnectionToken } from './shared/token.util';

export type ConnectionFactoryProvider = FactoryProvider<AmqpConnectionManager | Promise<AmqpConnectionManager>>;
export type ConnectionOptionsFactoryProvider = FactoryProvider<AmqpConnectionOptions | Promise<AmqpConnectionOptions>>;

export const createAmqpConnection = (name: string): ConnectionFactoryProvider => ({
  provide: getAmqpConnectionToken(name),
  inject: [getAmqpConnectionOptionsToken(name)],
  useFactory: async (args: AmqpConnectionOptions): Promise<AmqpConnectionManager> => {
    /* use name as key to get connection instance? */
    const connection = connect(args.urls, args.options);
    AmqpContainer.getInstance().set(name, connection);
    return connection;
  }
});

export const createAsyncAmqpConnectionOptions = (
  options: AmqpAsyncConnectionOptions
): ConnectionOptionsFactoryProvider => {
  /* default using uniq symbol `AMQP_CONNECTION_OPTIONS` symbol as token */
  if (options.useFactory) {
    return {
      provide: getAmqpConnectionOptionsToken(options.name),
      inject: options.inject,
      useFactory: options.useFactory
    };
  }

  const inject = [(options.useClass || options.useExisting) as Type<AmqpConnectionOptionsFactory>];

  return {
    provide: getAmqpConnectionOptionsToken(options.name),
    inject: inject,
    useFactory: async (connectionOptionsFactory: AmqpConnectionOptionsFactory) => {
      return connectionOptionsFactory.createAMQPConnectionOptions();
    }
  };
};
