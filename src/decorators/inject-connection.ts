import { Inject } from '@nestjs/common'
import { getAMQPConnectionToken } from '../shared/token.util'

export const InjectAMQPConnection = (name?: string): ParameterDecorator => Inject(getAMQPConnectionToken(name))
