import { abi as BTKToken } from "../abis/TokenBSC.json";
import { abi as BSCBridge } from "../abis/BridgeBSC.json";
import { abi as ETKToken } from "../abis/TokenETH.json";
import { abi as ETHBridge } from "../abis/BridgeETH.json";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export interface ContractsConfig {
  name: string;
  abi: any;
  address: string;
}

export const Contracts: ContractsConfig[] = [
  {
    name: "ETHBridge",
    abi: ETHBridge,
    address: '0xc37792CEFAf5B4Cd86119E6a2beBc047B4C06313',
  },
  {
    name: "BSCBridge",
    abi: BSCBridge,
    address: '0x2D0D5B2F1C637979Da7653Eb628BAbe79fc2a112',
  },

  {
    name: "MVG",
    abi: BTKToken,
    address: '0xc45De8AB31140e9CeD1575eC53fFfFa1E3062576',
  },
];