# nestx-amqp

[![NPM](https://img.shields.io/npm/v/nestx-amqp.svg)](https://www.npmjs.com/package/nestx-amqp)
[![Github Workflow Status](https://github.com/nest-x/nestx-amqp/workflows/ci/badge.svg)](https://github.com/nest-x/nestx-amqp)
[![Codecov](https://codecov.io/gh/nest-x/nestx-amqp/branch/master/graph/badge.svg)](https://codecov.io/gh/nest-x/nestx-amqp)
[![Semantic-Release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Provide an `AMQP` connection as NestJS Module. Internally use [amqp-connection-manager](https://www.npmjs.com/package/amqp-connection-manager).

<br/>

## Features

- Provide an `AMQPModule` create `AmqpConnectionManager` async
- Provide an injectable amqp connection manager at global
- Provide decorators like `@PublishQueue` and `@SubscribeQueue` as method decorator for simple usage

<br/>

## Installation

```shell
yarn add nestx-amqp
```

<br/>

## Examples

### Register Module Async

```typescript
import { Module } from '@nestjs/common'
import { AMQPModule } from 'nestx-amqp'

@Module({
  imports: [
    AMQPModule.forRootAsync({
      useFactory: () => ({
        urls: ['amqp://devuser:devuser@localhost:5672?heartbeat=60'],
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

<br/>

### Inject AMQPConnectionManager

Use Symbol `AMQP_CONNECTION` for Injection:

Below is an abstract producer code sample.

```typescript
import { Inject, OnModuleInit } from '@nestjs/common'
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager'
import { Options } from 'amqplib'
import { AMQP_CONNECTION } from 'nestx-amqp'

export abstract class SimpleAbstractProducer implements OnModuleInit {
  channel: ChannelWrapper

  abstract getQueue(): string
  abstract getQueueOptions(): Options.AssertQueue

  constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: AmqpConnectionManager
  ) {}

  async onModuleInit() {
    this.channel = this.connectionManager.createChannel({
      json: true,
      setup: (channel) => channel.assertQueue(this.queue),
    })
    await this.channel.waitForConnect()
  }

  async send(message, options?: Options.Publish) {
    await this.channel.sendToQueue(this.queue, message, options)
  }
}
```

<br/>

### Advanced Usage with Decorators

> Currently, only support direct queue publish and subscribe

### Interface `Queue`

```typescript
export interface Queue {
  name: string
  options?: Options.AssertQueue
}

export interface RetryOptions {
  maxAttempts: number
}

export interface BaseConsumeOptions {
  prefetch: number
  exceptionQueue?: string
}

export type PublishQueueOptions = Options.Publish
export type ConsumeQueueOptions = BaseConsumeOptions & Partial<RetryOptions> & Options.Consume
```

#### `@PublishQueue()`

Provide a `MethodDecorator` easily publishing message to queue

**Options:**

```
@PublishQueue(queue: string | Queue, options?: amqplib.Options.Publish)
yourPublishQueueMethod(content:any, options?: amqplib.Options.Publish){}
```

**Example:**

> (You must register and enable `AMQPModule`)

```typescript
@Injectable()
class TestMessageService {
  queue = 'TEST.QUEUE'

  @PublishQueue(queue)
  async testPublishQueue(content) {
    console.log(`call test publish queue with ${JSON.stringify(content)}`)
  }
}
```

#### `@SubscribeQueue()`

Provide a `MethodDecorator` easily consuming message and support simply requeue logic

**Options:**

```
@SubscribeQueue(nameOrQueue: string | Queue, options?: ConsumeQueueOptions)
yourSubscribeQueueMethod(content){}
```

**ConsumeQueueOptions:**

```typescript
export interface RetryOptions {
  maxAttempts: number
}

export interface BaseConsumeOptions {
  prefetch: number
  exceptionQueue?: string
}

export type ConsumeQueueOptions = BaseConsumeOptions & Partial<RetryOptions>
```

**Example:**

> You must register and enable `AMQPModule`

```typescript
@Injectable()
class TestMessageService {
  queue = 'TEST.QUEUE'

  @SubscribeQueue(queue)
  async testSubscribeQueue(content) {
    // do your business handling code
    // save db? send email?
    console.log(`handling content ${JSON.stringify(content)}`)
  }
}
```

<br />

### Interface `Exchange`

```typescript
import { Options } from 'amqplib'

/**
 * @desc simply wrap amqp exchange definitions as interface
 * */
export interface Exchange {
  name: string
  type: string | 'direct' | 'fanout' | 'topic' | 'headers'
  options?: Options.AssertExchange
}

/**
 * @desc wrap amqp.Channel.publish(exchange: string, routingKey: string, content, options?: Publish): boolean
 *       as interface
 * */
export interface PublishExchangeOptions {
  routingKey: string
  options?: Options.Publish
}
```


#### `@PublishExchange()`

> Not Stable


Provide a `MethodDecorator` easily publishing message to exchange

**Options:**

```
@PublishExchange(exchange: string | Exchange, options?: PublishExchangeOptions)
yourPublishExchangeMethod(content:any, options?: PublishExchangeOptions){}
```

**Example:**

> No Example for stable usage, you can refer to unit test case (or submit PR)


<br />

#### `@UseAMQPConnection(name?:string)`

Provide a `MethodDecorator` easily spec connection (when you register AMQPModule) with `@PublisQueue()` and `@SubscribeQueue`)

> Recommend if you want to develop npm package using spec named connection

**Example:**

```typescript
@Injectable()
class AMQPLoggerService {
  queue = 'LOGGER.QUEUE'

  @UseAMQPConnection('logger')
  @PublishQueue(queue)
  async logSideEffect(content) {
    // just do nothing here and auto send to LOGGER.QUEUE with spec `logger` connection
  }
}
```

<br />

for more details, you can refer unittest cases.

## Change Log

See [CHANGELOG.md](./CHANGELOG.md)

<br />

## LICENSE

Released under [MIT License](./LICENSE).
