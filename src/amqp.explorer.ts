import { Injectable, OnModuleInit } from '@nestjs/common'
import { DiscoveryService, MetadataScanner, ModuleRef, Reflector } from '@nestjs/core'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { AMQPMetadataAccessor } from './amqp-metadata.accessor'
import { PUBLISH_QUEUE_METADATA_TOKEN } from './amqp.constants';

@Injectable()
export class AMQPExplorer implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly metadataAccessor: AMQPMetadataAccessor,
    private readonly reflector: Reflector
  ) {}

  onModuleInit() {
    this.explore()
  }

  explore() {
    const providers = this.discoveryService.getProviders().filter((wrapper: InstanceWrapper) => {
      if (wrapper.name === 'TestPublishQueueService') {
        console.log(Reflect.getMetadataKeys(wrapper))
        console.log(Reflect.getMetadataKeys(wrapper.metatype))
      }

      return this.metadataAccessor.isPublishQueue(wrapper.metatype)
    })

  }
}
