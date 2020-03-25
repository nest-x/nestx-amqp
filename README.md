# nestx-amqp

[![NPM](https://img.shields.io/npm/v/nestx-amqp.svg)](https://www.npmjs.com/package/nestx-amqp)
[![Github Workflow Status](https://github.com/nest-x/nestx-amqp/workflows/ci/badge.svg)](https://github.com/nest-x/nestx-amqp)
[![Codecov](https://codecov.io/gh/nest-x/nestx-amqp/branch/master/graph/badge.svg)](https://codecov.io/gh/nest-x/nestx-amqp)
[![Semantic-Release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Provide an `AMQP` connection as NestJS Module. Internally use [amqp-connection-manager](https://www.npmjs.com/package/amqp-connection-manager).

<br/>

## Features

- Provide an `AMQPModule` create `AMQPConnectionManager` async
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
  channelWrapper: ChannelWrapper

  abstract getQueue(): string
  abstract getQueueOptions(): Options.AssertQueue

  constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: AmqpConnectionManager,
  ) {}

  async onModuleInit() {
    this.channelWrapper = this.connectionManager.createChannel({
      json: true,
      setup: channel => channel.assertQueue(this.queue),
    })
    await this.channelWrapper.waitForConnect()
  }

  async send(message, options?: Options.Publish) {
    await this.channelWrapper.sendToQueue(this.queue, message, options)
  }
}
```

<br/>

### Advanced Usage with Decorators

> Currently, only support direct queue publish and subscribe

#### `@PublishQueue()`

Provide a `MethodDecorator` easily publishing message to queue

**Options:**

```
@PublishQueue(queue:string, options?: amqplib.Options.AssertQueue)
methodYouDefinedInService(content:any, options?: amqplib.Options.Publish){}
```

**Example:**

> (You must register and enable `AMQPModule`)

```typescript
@Injectable()
class TestMessageService {

  @PublishQueue(queue, queueOptions)
  async testPublishQueue(content, options?) {
    // do your post business-logic here
  }
}
```

#### `@SubscribeQueue()`

Provide a `MethodDecorator` easily consuming message and support simply requeue logic

**Options:**

```
@SubscribeQueue(queue:string, options?: amqplib.Options.AssertQueue, consumeOptions?: ConsumeOptions)
methodYouDefinedInService(content:any){}
```

**ConsumeOptions:**

```typescript
export interface RetryOptions {
  maxAttempts: number
}

export interface BaseConsumeOptions {
  prefetch: number
  exceptionQueue?: string
}

export type ConsumeOptions = BaseConsumeOptions & Partial<RetryOptions>
```

**Example:**

> You must register and enable `AMQPModule`

```typescript
@Injectable()
class TestMessageService {
  @SubscribeQueue(queue, queueOptions)
  async testSubscribeQueue(content, options?) {
    // do your business handling code
    // save db? send email?
    // throw error when processing failed
  }
}
```
<br />

## Change Log

See [CHANGELOG.md](./CHANGELOG.md)

<br />

## LICENSE

Released under [MIT License](./LICENSE).
