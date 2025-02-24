"use client";

import { useAtomValue } from "jotai";
import {
  currentWalletAtom,
  l1PortalAtom,
  l1PortalManagerAtom,
  l1TokenContractAddressAtom,
  l1TokenManagerAtom,
  l2BridgeContractAtom,
  l2TokenContractAtom,
} from "../atoms";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDeployL2Token } from "../hooks/useL2DeployToken";
// import { useL1DeployToken } from "../hooks/useL1DeployToken";
import { toast } from "sonner";
import { useBridgeTokens } from "../hooks/useBridgeTokens";

export default function Admin() {
  const currentWallet = useAtomValue(currentWalletAtom);
  const [l1TokenName, setL1TokenName] = useState("");
  const [l2TokenName, setL2TokenName] = useState("");
  const [l1TokenSymbol, setL1TokenSymbol] = useState("");
  const [l2TokenSymbol, setL2TokenSymbol] = useState("");
  const l2TokenContract = useAtomValue(l2TokenContractAtom);
  const l1TokenContractAddress = useAtomValue(l1TokenContractAddressAtom);
  const l1Portal = useAtomValue(l1PortalAtom);
  const l2BridgeContract = useAtomValue(l2BridgeContractAtom);
  const l1PortalManager = useAtomValue(l1PortalManagerAtom);
  const l1TokenManager = useAtomValue(l1TokenManagerAtom);
  const [l1Balance, setL1Balance] = useState(BigInt(0));
  const [l2Balance, setL2Balance] = useState(BigInt(0));
  const [l1MintAmount, setL1MintAmount] = useState("");
  const [isL1TokenMinting, setL1TokenMinting] = useState(false);
  const [toSendAmountToL2, setToSendAmountToL2] = useState("");

  const ownerAztecAddress = currentWallet?.getAddress();

  const { deployL2Token, deployL2BridgeContract } = useDeployL2Token({
    ownerWallet: currentWallet,
    ownerAztecAddress: ownerAztecAddress,
    tokenName: l2TokenName,
    tokenSymbol: l2TokenSymbol,
  });

  // const {
  //   deployL1Token,
  //   deployTokenPortal,
  //   initializeL1PortalManager,
  //   ownerEthAddress,
  // } = useL1DeployToken({
  //   tokenName: l1TokenName,
  //   tokenSymbol: l1TokenSymbol,
  // });

  const { bridgeTokensToL2, claimBridgedTokensToL2, isBridging, isClaiming } =
    useBridgeTokens({
      ownerAztecAddress,
      amount: BigInt(toSendAmountToL2),
    });

  useEffect(() => {
    const fetchL1Balance = async () => {
      if (!l1TokenManager) {
        toast.error("l1 token manager not found while fetching balance");
        console.log("l1 token manager not found while fetching balance");
        return;
      }
      // const l1Balance = await l1TokenManager.getL1TokenBalance(ownerEthAddress);
      console.log("fetched l1 balance", l1Balance);

      setL1Balance(l1Balance);
    };

    fetchL1Balance();
  }, [l1TokenManager, l1Balance, isClaiming]);
  // }, [l1TokenManager, ownerEthAddress, l1Balance, isClaiming]);

  useEffect(() => {
    const fetchL2Balance = async () => {
      if (!l2TokenContract || !ownerAztecAddress) {
        toast.error(
          "L2 token contract or ownerAztecAddress not found while fetching l2 balance"
        );
        return;
      }
      const balance = await l2TokenContract.methods
        .balance_of_public(ownerAztecAddress)
        .simulate();

      setL2Balance(balance);
    };

    fetchL2Balance();
  }, [l2TokenContract, ownerAztecAddress, isClaiming]);

  const mintL1Token = async () => {
    if (!l1TokenManager) {
      toast.error("L1 token manager not found");
      return;
    }
    try {
      setL1TokenMinting(true);
      // await l1TokenManager.mint(BigInt(l1MintAmount), ownerEthAddress);
      // const l1Balance = await l1TokenManager.getL1TokenBalance(ownerEthAddress);
      setL1Balance(l1Balance);
      console.log("new minted tokens", l1Balance);
      toast.success(`${l1MintAmount} MINTED successfully on L1`);
    } catch (error) {
      toast.error(`error minting tokens , ${error}`);
    } finally {
      setL1TokenMinting(false);
      console.log("MINTING DONE");
      toast.success("MINTING DONE OF THE TOKENS");
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[900px] mx-auto">
      <div className="bg-primary/30">
        L1 Balance of
        {/* {ownerEthAddress}:  */}
        {l1Balance}
      </div>

      <div className="bg-primary/30">
        L2 Balance of {ownerAztecAddress?.toString()}: {l2Balance}
      </div>
      {!l2TokenContract && (
        <div className="flex flex-col gap-4 border border-dashed p-4">
          <h2>Deploy L2 token</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="set token name"
              value={l2TokenName}
              onChange={(e) => setL2TokenName(e.target.value)}
            />

            <Input
              placeholder="set token symbol"
              value={l2TokenSymbol}
              onChange={(e) => setL2TokenSymbol(e.target.value)}
            />
          </div>

          <Button
            onClick={deployL2Token}
            disabled={!l2TokenName.length || !l2TokenSymbol.length}
          >
            Deploy L2 Token
          </Button>
        </div>
      )}

      {!l1TokenContractAddress && (
        <div className="flex flex-col gap-4 border border-dashed p-4">
          <h2>Deploy L1 token</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="set token name"
              value={l1TokenName}
              onChange={(e) => setL1TokenName(e.target.value)}
            />

            <Input
              placeholder="set token symbol"
              value={l1TokenSymbol}
              onChange={(e) => setL1TokenSymbol(e.target.value)}
            />
          </div>

          <Button
            // onClick={deployL1Token}
            disabled={!l1TokenName.length || !l1TokenSymbol.length}
          >
            Deploy L1 Token
          </Button>
        </div>
      )}

      {!l1Portal && (
        <div className="flex flex-col gap-4 border border-dashed p-4">
          <Button
          //  onClick={deployTokenPortal}
          >
            Deploy Token Portal
          </Button>
        </div>
      )}

      {!l2BridgeContract && (
        <div className="flex flex-col gap-4 border border-dashed p-4">
          <Button onClick={deployL2BridgeContract}>
            Deploy L2 Bridge Contract
          </Button>
        </div>
      )}

      {!l1PortalManager && (
        <div className="flex flex-col gap-4 border border-dashed p-4">
          <Button
          //  onClick={initializeL1PortalManager}
          >
            Initialize l1 Portal Manager
          </Button>
        </div>
      )}

      <div>
        Mint L1 Balance
        <div className="flex gap-4 py-4">
          <Input
            placeholder="Amount to mint tokens of L1"
            value={l1MintAmount}
            onChange={(e) => {
              setL1MintAmount(e.target.value);
            }}
            type="number"
          />
          <Button onClick={mintL1Token}>
            Mint {l1MintAmount} L1 Tokens
            {isL1TokenMinting && " ..."}
          </Button>
        </div>
      </div>

      <div>
        Bridge tokens from L1 to L2
        <Input
          type="number"
          placeholder="Amount to bridge to L2"
          value={toSendAmountToL2}
          onChange={(e) => setToSendAmountToL2(e.target.value)}
        />
        <Button onClick={bridgeTokensToL2}>
          Bridge {toSendAmountToL2} Token to L2
          {isBridging && "..."}
        </Button>
        <Button onClick={claimBridgedTokensToL2}>
          Claim {toSendAmountToL2} tokens to L2
          {isClaiming && "..."}
        </Button>
      </div>
    </div>
  );
}
