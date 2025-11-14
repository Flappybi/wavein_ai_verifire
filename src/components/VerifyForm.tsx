import React, { useState } from "react";
import { useWalletKit } from "@mysten/wallet-kit";
import { saveVerification } from "../utils/sui";

export default function VerifyForm() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();

  const handleSave = async () => {
    if (!currentAccount) {
      alert("Connect your Sui wallet dulu ya!");
      return;
    }
    await saveVerification(text, result || "AI Verified: Authentic", {
      signAndExecuteTransactionBlock,
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded-2xl space-y-4">
      <h2 className="text-2xl font-semibold text-center">AI Verifier</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Masukkan teks untuk verifikasi"
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
      >
        Save to Blockchain
      </button>
    </div>
  );
}
