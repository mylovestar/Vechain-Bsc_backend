import Web3 from "web3";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export const getWeb3 = (network: "MVG" | "BSC") => {
  return new Web3(
    'https://bsc-dataseed.binance.org'
  );
};

