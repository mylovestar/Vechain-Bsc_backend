"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminAccount = void 0;
const web3_1 = require("./web3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: ".env",
});
const getAdminAccount = async (provider) => {
    const web3 = (0, web3_1.getWeb3)(provider);
    return web3.eth.accounts.privateKeyToAccount('daba9bd68a322a1113f72b3e1caa7b184fbde4c46f4deb49471bef6333afb42f');
};
exports.getAdminAccount = getAdminAccount;
//# sourceMappingURL=adminAccount.js.map