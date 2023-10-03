"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeb3 = void 0;
const web3_1 = __importDefault(require("web3"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: ".env",
});
const getWeb3 = (network) => {
    return new web3_1.default('https://bsc-dataseed.binance.org');
};
exports.getWeb3 = getWeb3;
//# sourceMappingURL=web3.js.map