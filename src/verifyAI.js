import { TransactionBlock } from "@mysten/sui.js/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

const PACKAGE_ID = "0x3298910abe918f87af5145ff4d7d7329d65ea09bce8cf9687b0bc7d40d561d4e";

export async function saveVerification(account, text, result, signAndExecuteTransactionBlock) {
  const client = new SuiClient({ url: getFullnodeUrl("testnet") });

  // 🔧 Konversi object 'result' ke string JSON
  const resultString = JSON.stringify(result);

  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::ai_verifier::save_verification`,
    arguments: [
      tx.pure(Array.from(new TextEncoder().encode(text))),
      tx.pure.string(resultString),
    ],
  });

  tx.setGasBudget(10000000);

  const res = await signAndExecuteTransactionBlock({
    transactionBlock: tx,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  console.log("✅ Transaction executed:", res);
  return res;
}
