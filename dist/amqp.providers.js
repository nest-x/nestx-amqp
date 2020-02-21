"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = require("amqp-connection-manager");
const amqp_constants_1 = require("./amqp.constants");
exports.createAMQPConnection = () => ({
    provide: amqp_constants_1.AMQP_CONNECTION,
    inject: [amqp_constants_1.AMQP_CONNECTION_OPTIONS],
    useFactory: (args) => __awaiter(void 0, void 0, void 0, function* () {
        return amqp.connect(args.urls, args.options);
    })
});
exports.createAsyncAMQPConnectionOptions = (options) => ({
    provide: amqp_constants_1.AMQP_CONNECTION_OPTIONS,
    inject: options.inject,
    useFactory: options.useFactory
});
