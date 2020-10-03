import { Inject, SetMetadata } from '@nestjs/common';
import { USE_AMQP_CONNECTION_TOKEN } from '../amqp.constants';
import { getAmqpConnectionToken } from '../shared/token.util';

export const InjectAmqpConnection = (name?: string): ParameterDecorator => Inject(getAmqpConnectionToken(name));
export const UseAmqpConnection = (name?: string): MethodDecorator => SetMetadata(USE_AMQP_CONNECTION_TOKEN, name);
