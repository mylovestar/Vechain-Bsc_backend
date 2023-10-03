// import { useState } from "react"
import { Request, Response } from "express";
import Web3 from "web3";
import { Framework } from "@vechain/connex-framework";
import { Driver, SimpleNet } from "@vechain/connex-driver";
import { ethers } from "@vechain/ethers";
// import { useEffect, useState } from "react";
import logger from "../utils/logger";
import { getWeb3 } from "../utils/web3";
import { getContracts } from "../utils/contracts";
import { getAdminAccount } from "../utils/adminAccount";
import { BridgeETH } from "../types/BridgeETH";
import { BridgeBSC } from "../types/BridgeBSC";
import { getBSCTokenContracts } from "../utils/BSCtokencontracts";
import { abi as VeBridge } from "../abis/BridgeETH.json";

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

const amountFetcher = async (txHash: string, selectTokenName: string, web3: Web3) => {
  const receipt = await web3.eth.getTransaction(txHash);

  let amount;
  if (selectTokenName === 'MVG') {
    amount = receipt.value;
  } else {
    amount = web3.utils.hexToNumberString(`0x${receipt.input.slice(11, 74)}`);
  }
  return [amount, receipt.from];
};

const amountFetcherConnex = async (txHash: string, selectTokenName: string, web3: Web3, connex: Connex) => {
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
}

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

const burnMinterMethod = async (
  res: Response,
  target: "BSC" | "MVG",
  bridge: BridgeETH | BridgeBSC,
  recipient: string,
  burnedAmount: string,
  tokenaddress: string,
  nonce: string,
  account: any
) => {
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
      logger.info("✅: Minting is done! ");
      return res.status(200).json({
        message: `Minting done for ${target}. Please check your balance!`,
      });
    })
    .once("error", (error) => {
      console.log(error.message);
      return new Error("error");
    });
};

const etxMinterMethod = async (
  res: Response,
  hash: string,
  target: "BSC" | "MVG",
  bridge: BridgeETH | BridgeBSC,
  recipient: string,
  burnedAmount: string,
  nonce: string,
  account: any
) => {
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
      logger.info("✅: Minting is done! ");
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

export const mintETH = async (req: Request, res: Response) => {
  try {
    const { txHash } = req.body;
    const account = await getAdminAccount("BSC");
    const [ethBridge, bscBridge] = await getContracts();
    logger.info(`ℹ: txHash for burning BTK on binance: ${txHash}`);

    const [burnedAmount, recipient] = await amountFetcher(
      txHash,
      'bMVG',
      getWeb3("BSC")
    );
    let burnedAmount1 = "";
    burnedAmount1 = getWeb3("MVG").utils.toWei((parseFloat(burnedAmount) / (10 ** 18)).toFixed(18), "ether");
    const bscBridgeNonce = await bscBridge.methods.getNonce().call({
      from: account.address,
    });
    logger.info(`✅${bscBridgeNonce} `);
    const hash = await bscBridge.methods.getHash(burnedAmount1, Number(bscBridgeNonce).toString()).call({
      from: account.address,
    });
    await etxMinterMethod(
      res,
      hash,
      "MVG",
      ethBridge,
      recipient,
      burnedAmount1,
      bscBridgeNonce,
      account
    );
    return;
  } catch (err: any) {
    logger.error(`Can't mint the tokens!: ${err.message}`);
    res.status(500).json({
      message: "Can't mint the tokens!",
    });
  }
};

/**
 * method for starting the minting process on binance-chain
 * @param req the request object
 * @param res the response object
 */

export const mintBSC = async (req: Request, res: Response) => {
  try {
    const { txHash, accountConnected } = req.body;
    const account = await getAdminAccount("MVG");
    console.log("account", accountConnected);
    const [ethBridge, bscBridge] = await getContracts();

    const driver = await Driver.connect(
      new SimpleNet("https://mainnet.veblocks.net")
    );
    const connex = new Framework(driver);
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

    logger.info(`ℹ: txHash for burning MVG on vechain: ${txHash}`);
    setTimeout(() => { }, 10000);
    // const [burnedAmount, recipient] = await amountFetcher(
    //   txHash,
    //   "MVG",
    //   getWeb3("MVG")
    // );

    let [burnedAmount, recipient] = await amountFetcherConnex(
      txHash,
      "MVG",
      getWeb3("MVG"),
      connex
    );
    let token1address = "";
    let burnedAmount1 = "";
    burnedAmount = burnedAmount ? burnedAmount : '0';
    recipient = recipient ? accountConnected : '0x0000000000000000000000000000000000000000';
    token1address = "0xc45De8AB31140e9CeD1575eC53fFfFa1E3062576";
    burnedAmount1 = getWeb3("BSC").utils.toWei((parseFloat(burnedAmount) / (10 ** 18)).toFixed(18), "ether");
    logger.info(`✅:  Amount of MVG burned is ${burnedAmount}`);
    logger.info(`✅:  Minting for ${burnedAmount1} MVG in progress`);

    const executeContractRead = async (methodName: any, ...methodArgs: any) => {
      const abi: any = VeBridge.find(methodABI => {
        return methodABI.name === methodName
      })

      const methodObj = connex.thor.account('0xc37792CEFAf5B4Cd86119E6a2beBc047B4C06313').method(abi)
      const retval = await methodObj.call(...methodArgs)
      // console.log("retval", retval);

      return retval.decoded[0]
    }
    const ethBridgeNonce = await executeContractRead("getNonce");

    // const ethBridgeNonce = await ethBridge.methods.getNonce().call({
    //   from: account.address,
    // });
    // console.log("ethBridgeNonce", ethBridgeNonce);
    logger.info(`✅${ethBridgeNonce} `);
    // const hash = await ethBridge.methods.getHash(burnedAmount1, Number(ethBridgeNonce).toString()).call({
    //   from: account.address,
    // });
    await burnMinterMethod(
      res,
      "BSC",
      bscBridge,
      recipient as any,
      burnedAmount1,
      token1address,
      ethBridgeNonce,
      account
    );
  } catch (err: any) {
    logger.error(`Can't mint the tokens!: ${err.message}`);
    res.status(500).json({
      message: "Error while minting. Please try again!",
    });
  }
};

export const BridgeBalance = async (req: Request, res: Response) => {
  try {
    var toChainID = req.body.toChainId;
    const balances = await amountBridge(toChainID);
    res.status(200).json({
      balances
    });
  } catch (err: any) {
    logger.error(`Can't find amount!: ${err.message}`);
    res.status(500).json({
      message: "Error while searching. Please try again!",
    });
  }
};


const amountBridge = async (
  toChainID: number,
) => {
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
  const [bMVG] = await getBSCTokenContracts();
  balances[0] = await bMVG.methods.balanceOf("0x2D0D5B2F1C637979Da7653Eb628BAbe79fc2a112").call({});
  // }
  return balances;
};