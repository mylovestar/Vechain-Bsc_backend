"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = void 0;
const TokenBSC_json_1 = require("../abis/TokenBSC.json");
const BridgeBSC_json_1 = require("../abis/BridgeBSC.json");
const BridgeETH_json_1 = require("../abis/BridgeETH.json");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: ".env",
});
exports.Contracts = [
    {
        name: "ETHBridge",
        abi: BridgeETH_json_1.abi,
        address: '0xc37792CEFAf5B4Cd86119E6a2beBc047B4C06313',
    },
    {
        name: "BSCBridge",
        abi: BridgeBSC_json_1.abi,
        address: '0x2D0D5B2F1C637979Da7653Eb628BAbe79fc2a112',
    },
    {
        name: "MVG",
        abi: TokenBSC_json_1.abi,
        address: '0xc45De8AB31140e9CeD1575eC53fFfFa1E3062576',
    },
];
//# sourceMappingURL=config.js.map