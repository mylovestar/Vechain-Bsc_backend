"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: "info",
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: "loggers.log" }),
    ],
    format: winston_1.default.format.simple(),
});
exports.default = logger;
//# sourceMappingURL=logger.js.map