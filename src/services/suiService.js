// src/services/suiService.js
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

// 🌐 Hubungkan ke jaringan testnet
export const client = new SuiClient({ url: getFullnodeUrl("testnet") });

/* -------------------------------------------------------------------------- */
/* ⚙️  Fungsi-fungsi utama untuk smart contract kamu                          */
/* -------------------------------------------------------------------------- */

// ✅ Simpan hasil verifikasi AI ke blockchain
export async function saveVerification(wallet, text, result) {
  try {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::ai_verifier::save_verification`, // ganti PACKAGE_ID nanti
      arguments: [
        tx.pure(Array.from(new TextEncoder().encode(text))),
        tx.pure(result),
      ],
    });

    const res = await wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: { showEffects: true },
    });

    return res;
  } catch (err) {
    console.error("❌ Error saving verification:", err);
    throw err;
  }
}

// ✅ Ambil data hasil verifikasi dari blockchain
export async function getAllVerifications() {
  const objects = await client.getOwnedObjects({
    owner: process.env.MODULE_ADDRESS, // alamat modulmu nanti
    options: { showContent: true },
  });
  return objects;
}
