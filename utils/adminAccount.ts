import { getWeb3 } from "./web3";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export const getAdminAccount = async (provider: "MVG" | "BSC") => {
  const web3 = getWeb3(provider);
  return web3.eth.accounts.privateKeyToAccount('daba9bd68a322a1113f72b3e1caa7b184fbde4c46f4deb49471bef6333afb42f');
};
