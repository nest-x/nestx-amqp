# nestx-amqp

[![NPM](https://img.shields.io/npm/v/@nestx/amqp.svg)](https://www.npmjs.com/package/@nestx/amqp)
[![Github Workflow Status](https://github.com/nest-x/nestx-amqp/workflows/ci/badge.svg)](https://github.com/nest-x/nestx-amqp)
[![Codecov](https://codecov.io/gh/nest-x/nestx-amqp/branch/master/graph/badge.svg)](https://codecov.io/gh/nest-x/nestx-amqp)
[![Semantic-Release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


Provide an `AMQP` connection as NestJS Module. Internally use [amqp-connection-manager](https://www.npmjs.com/package/amqp-connection-manager).



## Features

- Provide an `AMQPModule` create `AMQPConnectionManager` async
- Provide an injectable amqp connection manager at global


## Installation

```shell script
yarn add nestx-amqp
```


## Examples

### Register Module Async


```typescript
import { Module } from '@nestjs/common';
import { AMQPModule } from 'nestx-amqp;


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


### Inject AMQPConnectionManager

Use Symbol `AMQP_CONNECTION` for Injection:

Below is a abstract producer code sample. (provide at `nestx-amqp` as external shared class)

```typescript
import { Inject, OnModuleInit } from '@nestjs/common';
import { AMQP_CONNECTION } from 'nestx-amqp';
import * as amqp from 'amqp-connection-manager';
import { Options } from 'amqplib/properties';

export abstract class SimpleAbstractProducer implements OnModuleInit {
  channelWrapper: amqp.ChannelWrapper;

  abstract get queue(): string;
  abstract get queueOptions(): Options.AssertQueue;

  public constructor(
    @Inject(AMQP_CONNECTION)
    readonly connectionManager: amqp.AmqpConnectionManager
  ) {}

  async onModuleInit() {
    this.channelWrapper = this.connectionManager.createChannel({
      json: true,
      setup: (channel) => {
        return channel.assertQueue(this.queue);
      }
    });
    await this.channelWrapper.waitForConnect();
  }

  async send(message, options?: Options.Publish) {
    await this.channelWrapper.sendToQueue(this.queue, message, options);
  }
}

```
