"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AMQPModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const amqp_constants_1 = require("./amqp.constants");
const amqp_providers_1 = require("./amqp.providers");
let AMQPModule = AMQPModule_1 = class AMQPModule {
    static register(options) {
        return {
            module: AMQPModule_1,
            providers: [
                {
                    provide: amqp_constants_1.AMQP_CONNECTION_OPTIONS,
                    useValue: options
                },
                amqp_providers_1.createAMQPConnection()
            ],
            exports: [amqp_constants_1.AMQP_CONNECTION]
        };
    }
    static forRootAsync(options) {
        return {
            module: AMQPModule_1,
            imports: options.imports,
            providers: [
                {
                    provide: amqp_constants_1.AMQP_CONNECTION_OPTIONS,
                    useValue: options
                },
                amqp_providers_1.createAsyncAMQPConnectionOptions(options),
                amqp_providers_1.createAMQPConnection()
            ],
            exports: [amqp_constants_1.AMQP_CONNECTION]
        };
    }
};
AMQPModule = AMQPModule_1 = __decorate([
    common_1.Global(),
    common_1.Module({})
], AMQPModule);
exports.AMQPModule = AMQPModule;
