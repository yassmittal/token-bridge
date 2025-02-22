"use client";

import { useAtomValue } from "jotai";
import { currentWalletAtom, L2TokenContractAtom } from "../atoms";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDeployL2Token } from "../hooks/useL2DeployToken";

export default function Admin() {
  const currentWallet = useAtomValue(currentWalletAtom);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const L2TokenContract = useAtomValue(L2TokenContractAtom);

  const { deployL2Token } = useDeployL2Token({
    ownerWallet: currentWallet,
    ownerAztecAddress: currentWallet?.getAddress(),
    tokenName,
    tokenSymbol,
  });

  console.log("L2TokenContract", L2TokenContract);

  return (
    <div>
      {!L2TokenContract && (
        <>
          <Input
            placeholder="set token name"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
          />

          <Input
            placeholder="set token symbol"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
          />

          <Button
            onClick={deployL2Token}
            disabled={!tokenName.length || !tokenSymbol.length}
          >
            Deploy Token
          </Button>
        </>
      )}
    </div>
  );
}
