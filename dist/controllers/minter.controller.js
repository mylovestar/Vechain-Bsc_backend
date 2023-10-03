"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeBalance = exports.mintBSC = exports.mintETH = void 0;
const connex_framework_1 = require("@vechain/connex-framework");
const connex_driver_1 = require("@vechain/connex-driver");
// import { useEffect, useState } from "react";
const logger_1 = __importDefault(require("../utils/logger"));
const web3_1 = require("../utils/web3");
const contracts_1 = require("../utils/contracts");
const adminAccount_1 = require("../utils/adminAccount");
const BSCtokencontracts_1 = require("../utils/BSCtokencontracts");
const BridgeETH_json_1 = require("../abis/BridgeETH.json");
/**
 *
 * @param txHash the burn hash for the transaction that's being processed by the user
 * @param web3 the web3 instance that should be used to connect with the chain for getting the data
 * @returns the amount burned and verification for the transaction
 */
//  const [app, setApp] = useState<any>({
//   connex: undefined,
//   vendor: undefined,
// });
// useEffect(() => {
//   const connex = new Connex({
//     node: 'https://mainnet.veblocks.net/',
//     network: 'main'
//   })
//   const vendor = new Connex.Vendor("main")
//   setApp((prevState: any) => {
//     return {
//       ...prevState,
//       connex: connex,
//       vendor: vendor
//     }
//   })
// }, [])
const amountFetcher = async (txHash, selectTokenName, web3) => {
    const receipt = await web3.eth.getTransaction(txHash);
    let amount;
    if (selectTokenName === 'MVG') {
        amount = receipt.value;
    }
    else {
        amount = web3.utils.hexToNumberString(`0x${receipt.input.slice(11, 74)}`);
    }
    return [amount, receipt.from];
};
const amountFetcherConnex = async (txHash, selectTokenName, web3, connex) => {
    const receiptConnex = await connex.thor.transaction(txHash).get();
    const receipt = receiptConnex?.clauses[0];
    console.log("receipt", receiptConnex);
    let amount;
    if (selectTokenName === 'MVG') {
        //   amount = receipt?.value;
        // } else {
        amount = web3.utils.hexToNumberString(`0x${receipt?.data.slice(11, 74)}`);
    }
    return [amount, receiptConnex?.origin];
};
/**
 *
 * @param res takes the response object for express
 * @param target the target token data for displaying in the logger and returning in response
 * @param bridge the bridge container for calling the functions on them
 * @param recipient the recipient that will receive the transferred token
 * @param burnedAmount the amount to mint
 * @param nonce the nonce value for other chain to restrict double spending
 * @param account the admin account from which the transaction will be processing
 */
const burnMinterMethod = async (res, target, bridge, recipient, burnedAmount, tokenaddress, nonce, account) => {
    bridge.methods
        .mint(recipient, burnedAmount, nonce, tokenaddress)
        .send({
        from: account.address,
        gas: "1000000",
    })
        .once("transactionHash", function (hash) {
        console.log(hash);
    })
        .once("confirmation", function () {
        logger_1.default.info("✅: Minting is done! ");
        return res.status(200).json({
            message: `Minting done for ${target}. Please check your balance!`,
        });
    })
        .once("error", (error) => {
        console.log(error.message);
        return new Error("error");
    });
};
const etxMinterMethod = async (res, hash, target, bridge, recipient, burnedAmount, nonce, account) => {
    bridge.methods
        .etxMint(recipient, burnedAmount, nonce, hash)
        .send({
        from: account.address,
        gas: "1000000",
    })
        .once("transactionHash", function (hash) {
        console.log(hash);
    })
        .once("confirmation", function () {
        logger_1.default.info("✅: Minting is done! ");
        return res.status(200).json({
            message: `Minting done for ${target}. Please check your balance!`,
        });
    })
        .once("error", (error) => {
        console.log(error.message);
        return new Error("error");
    });
};
//----------------------------------------------------------------------------------------------------------------------
// CONTROLLER FUNCTIONS
/**
 * method for starting the minting process on ethereum
 * @param req the request object
 * @param res the response object
 */
const mintETH = async (req, res) => {
    try {
        const { txHash } = req.body;
        const account = await (0, adminAccount_1.getAdminAccount)("BSC");
        const [ethBridge, bscBridge] = await (0, contracts_1.getContracts)();
        logger_1.default.info(`ℹ: txHash for burning BTK on binance: ${txHash}`);
        const [burnedAmount, recipient] = await amountFetcher(txHash, 'bMVG', (0, web3_1.getWeb3)("BSC"));
        let burnedAmount1 = "";
        burnedAmount1 = (0, web3_1.getWeb3)("MVG").utils.toWei((parseFloat(burnedAmount) / (10 ** 18)).toFixed(18), "ether");
        const bscBridgeNonce = await bscBridge.methods.getNonce().call({
            from: account.address,
        });
        logger_1.default.info(`✅${bscBridgeNonce} `);
        const hash = await bscBridge.methods.getHash(burnedAmount1, Number(bscBridgeNonce).toString()).call({
            from: account.address,
        });
        await etxMinterMethod(res, hash, "MVG", ethBridge, recipient, burnedAmount1, bscBridgeNonce, account);
        return;
    }
    catch (err) {
        logger_1.default.error(`Can't mint the tokens!: ${err.message}`);
        res.status(500).json({
            message: "Can't mint the tokens!",
        });
    }
};
exports.mintETH = mintETH;
/**
 * method for starting the minting process on binance-chain
 * @param req the request object
 * @param res the response object
 */
const mintBSC = async (req, res) => {
    try {
        const { txHash, accountConnected } = req.body;
        const account = await (0, adminAccount_1.getAdminAccount)("MVG");
        console.log("account", accountConnected);
        const [ethBridge, bscBridge] = await (0, contracts_1.getContracts)();
        const driver = await connex_driver_1.Driver.connect(new connex_driver_1.SimpleNet("https://mainnet.veblocks.net"));
        const connex = new connex_framework_1.Framework(driver);
        // console.log("bridges", ethBridge, bscBridge);
        // const [app, setApp] = useState({
        //   connex  : undefined,
        //   vendor  : undefined,
        // });
        // setApp((prevState) => {
        //   return {
        //     ...prevState,
        //     connex : connex,
        //     vendor : vendor
        //   }
        // }
        logger_1.default.info(`ℹ: txHash for burning MVG on vechain: ${txHash}`);
        setTimeout(() => { }, 10000);
        // const [burnedAmount, recipient] = await amountFetcher(
        //   txHash,
        //   "MVG",
        //   getWeb3("MVG")
        // );
        let [burnedAmount, recipient] = await amountFetcherConnex(txHash, "MVG", (0, web3_1.getWeb3)("MVG"), connex);
        let token1address = "";
        let burnedAmount1 = "";
        burnedAmount = burnedAmount ? burnedAmount : '0';
        recipient = recipient ? accountConnected : '0x0000000000000000000000000000000000000000';
        token1address = "0xc45De8AB31140e9CeD1575eC53fFfFa1E3062576";
        burnedAmount1 = (0, web3_1.getWeb3)("BSC").utils.toWei((parseFloat(burnedAmount) / (10 ** 18)).toFixed(18), "ether");
        logger_1.default.info(`✅:  Amount of MVG burned is ${burnedAmount}`);
        logger_1.default.info(`✅:  Minting for ${burnedAmount1} MVG in progress`);
        const executeContractRead = async (methodName, ...methodArgs) => {
            const abi = BridgeETH_json_1.abi.find(methodABI => {
                return methodABI.name === methodName;
            });
            const methodObj = connex.thor.account('0xc37792CEFAf5B4Cd86119E6a2beBc047B4C06313').method(abi);
            const retval = await methodObj.call(...methodArgs);
            // console.log("retval", retval);
            return retval.decoded[0];
        };
        const ethBridgeNonce = await executeContractRead("getNonce");
        // const ethBridgeNonce = await ethBridge.methods.getNonce().call({
        //   from: account.address,
        // });
        // console.log("ethBridgeNonce", ethBridgeNonce);
        logger_1.default.info(`✅${ethBridgeNonce} `);
        // const hash = await ethBridge.methods.getHash(burnedAmount1, Number(ethBridgeNonce).toString()).call({
        //   from: account.address,
        // });
        await burnMinterMethod(res, "BSC", bscBridge, recipient, burnedAmount1, token1address, ethBridgeNonce, account);
    }
    catch (err) {
        logger_1.default.error(`Can't mint the tokens!: ${err.message}`);
        res.status(500).json({
            message: "Error while minting. Please try again!",
        });
    }
};
exports.mintBSC = mintBSC;
const BridgeBalance = async (req, res) => {
    try {
        var toChainID = req.body.toChainId;
        const balances = await amountBridge(toChainID);
        res.status(200).json({
            balances
        });
    }
    catch (err) {
        logger_1.default.error(`Can't find amount!: ${err.message}`);
        res.status(500).json({
            message: "Error while searching. Please try again!",
        });
    }
};
exports.BridgeBalance = BridgeBalance;
const amountBridge = async (toChainID) => {
    let balances = [];
    // if (toChainID === 31779) {
    //   let MVGbalance;
    //   const MVG_PROVIDER_URL = "https://mainnet.etxinfinity.com";
    //   let BSCweb3 = new Web3(new Web3.providers.HttpProvider(MVG_PROVIDER_URL));
    //   MVGbalance = await BSCweb3.eth.getBalance("0xeb4AA94f61AD1625094d39d1E4a97Ad0c4C1e55F"); // Bridge address
    //   console.log(MVGbalance);
    //   balances[0] = getWeb3("BSC").utils.toWei((parseFloat(MVGbalance) / (10 ** 18)).toFixed(18), "ether");
    // }
    // else {
    const [bMVG] = await (0, BSCtokencontracts_1.getBSCTokenContracts)();
    balances[0] = await bMVG.methods.balanceOf("0x2D0D5B2F1C637979Da7653Eb628BAbe79fc2a112").call({});
    // }
    return balances;
};
//# sourceMappingURL=minter.controller.js.map