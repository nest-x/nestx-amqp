import * as amqp from 'amqp-connection-manager';
import {
  AMQPAsyncConnectionOptions,
  AMQPConnectionOptions,
} from './amqp.options';
import { AMQP_CONNECTION, AMQP_CONNECTION_OPTIONS } from './amqp.constants';

/**
 * @desc create AMQPConnection internal use `amqp-connection-manager`
 * */
export const createAMQPConnection = () => ({
  provide: AMQP_CONNECTION,
  inject: [AMQP_CONNECTION_OPTIONS],
  useFactory: async (args: AMQPConnectionOptions) => {
    return amqp.connect(args.urls, args.options);
  },
});

export const createAsyncAMQPConnectionOptions = (
  options: AMQPAsyncConnectionOptions,
) => ({
  provide: AMQP_CONNECTION_OPTIONS,
  inject: options.inject,
  useFactory: options.useFactory,
});
