"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenContracts = void 0;
const config_1 = require("./config");
const web3_1 = require("./web3");
const adminAccount_1 = require("./adminAccount");
const getTokenContracts = async () => {
    const account = await (0, adminAccount_1.getAdminAccount)("MVG"); // you can use any option
    const ethWeb = (0, web3_1.getWeb3)("MVG");
    const bscWeb = (0, web3_1.getWeb3)("BSC");
    // adding the accounts to wallet so that we can make transactions from this address
    ethWeb.eth.accounts.wallet.add(account);
    bscWeb.eth.accounts.wallet.add(account);
    const contractInstances = [
        new ethWeb.eth.Contract(config_1.Contracts[3].abi, config_1.Contracts[3].address),
        new bscWeb.eth.Contract(config_1.Contracts[2].abi, config_1.Contracts[2].address)
    ];
    return contractInstances;
};
exports.getTokenContracts = getTokenContracts;
//# sourceMappingURL=tokencontracts.js.map