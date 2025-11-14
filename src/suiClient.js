import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";


export const client = new SuiClient({
  url: getFullnodeUrl("testnet"), // atau "mainnet" kalau nanti sudah live
});
