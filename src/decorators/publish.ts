import { Options } from 'amqplib'
import { Producer } from '../services/producer';

export const PublishQueue = (name: string, options?: Options.AssertQueue): MethodDecorator => {
  return (target, propertyKey, descriptor) => {


    return descriptor;
  }
}
