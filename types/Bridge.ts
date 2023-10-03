/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

export interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type Transfer = ContractEventLog<{
  from: string;
  to: string;
  amount: string;
  date: string;
  nonce: string;
  step: string;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}>;

export interface Bridge extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): Bridge;
  clone(): Bridge;
  methods: {
    admin(): NonPayableTransactionObject<string>;

    burn(_amount: number | string | BN): NonPayableTransactionObject<void>;

    getNonce(): NonPayableTransactionObject<string>;

    mint(
      reciever: string,
      amount: number | string | BN,
      otherChainNonce: number | string | BN
    ): NonPayableTransactionObject<void>;

    nonce(): NonPayableTransactionObject<string>;

    processedTransactionNonces(
      arg0: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    token(): NonPayableTransactionObject<string>;
  };
  events: {
    Transfer(cb?: Callback<Transfer>): EventEmitter;
    Transfer(options?: EventOptions, cb?: Callback<Transfer>): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "Transfer", cb: Callback<Transfer>): void;
  once(event: "Transfer", options: EventOptions, cb: Callback<Transfer>): void;
}
