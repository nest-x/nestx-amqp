import { Inject, SetMetadata } from '@nestjs/common';
import { USE_AMQP_CONNECTION_TOKEN } from '../amqp.constants';
import { getAMQPConnectionToken } from '../shared/token.util';

export const InjectAMQPConnection = (name?: string): ParameterDecorator => Inject(getAMQPConnectionToken(name));
export const UseAMQPConnection = (name?: string): MethodDecorator => SetMetadata(USE_AMQP_CONNECTION_TOKEN, name);
