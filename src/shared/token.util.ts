import { AMQP_CONNECTION, AMQP_CONNECTION_OPTIONS } from '../amqp.constants';

export const isSymbol = (fn: any): fn is symbol => typeof fn === 'symbol';

export const getAmqpConnectionOptionsToken = (name: string | symbol = AMQP_CONNECTION_OPTIONS): string | symbol => {
  if (name === AMQP_CONNECTION_OPTIONS) {
    return AMQP_CONNECTION_OPTIONS;
  }

  if (!isSymbol(name)) {
    return `${name}_AmqpConnectionOptions`;
  }
};

export const getAmqpConnectionToken = (name: string | symbol = AMQP_CONNECTION): string | symbol => {
  if (name === AMQP_CONNECTION) {
    return AMQP_CONNECTION;
  }

  if (!isSymbol(name)) {
    return `${name}_AmqpConnection`;
  }
};
