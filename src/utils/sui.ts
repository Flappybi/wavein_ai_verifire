import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";


const client = new SuiClient({ url: getFullnodeUrl("testnet") });

// Ganti ini dengan package ID punyamu
export const PACKAGE_ID =
  "0x3298910abe918f87af5145ff4d7d7329d65ea09bce8cf9687b0bc7d40d561d4e";

export async function saveVerification(text: string, result: string, signer: any) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::ai_verifier::save_verification`,
    arguments: [
      tx.pure.string(text),
      tx.pure.string(result),
    ],
  });

  tx.setGasBudget(100000000);

  const res = await signer.signAndExecuteTransactionBlock({
    transactionBlock: tx,
  });

  console.log("✅ Transaction success:", res);
  return res;
}
