import React from "react";
import { WalletKitProvider, ConnectButton } from "@mysten/wallet-kit";
import VerifyForm from "./components/VerifyForm";

function App() {
  return (
    <WalletKitProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-6">
        <ConnectButton />
        <VerifyForm />
      </div>
    </WalletKitProvider>
  );
}

export default App;
