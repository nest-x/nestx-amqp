import { Injectable, OnModuleInit } from '@nestjs/common'
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core'

@Injectable()
export class AMQPExplorer implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner
  ) {}

  onModuleInit() {
    this.explore()
  }

  explore() {

  }
}
