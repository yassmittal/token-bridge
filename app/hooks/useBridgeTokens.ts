import { useAtomValue } from "jotai";
import {
  l1PortalManagerAtom,
  l2BridgeContractAtom,
  l2TokenContractAtom,
} from "../atoms";
import { toast } from "sonner";
import { AztecAddress } from "@aztec/circuits.js";
import { L2AmountClaim } from "@aztec/aztec.js";
import { useState } from "react";

type UseBridgeTokensType = {
  ownerAztecAddress: AztecAddress | undefined;
  amount: bigint;
};

export const useBridgeTokens = ({
  ownerAztecAddress,
  amount,
}: UseBridgeTokensType) => {
  const l1PortalManager = useAtomValue(l1PortalManagerAtom);
  const l2TokenContract = useAtomValue(l2TokenContractAtom);
  const l2BridgeContract = useAtomValue(l2BridgeContractAtom);
  const [isBridging, setIsBridging] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claim, setClaim] = useState<L2AmountClaim | undefined>(undefined);

  const bridgeTokensToL2 = async () => {
    if (!l1PortalManager || !ownerAztecAddress) {
      toast.error(
        "l1PortalManager or ownerAztecAddress not found while bridging tokens"
      );
      return;
    }

    setIsBridging(true);

    try {
      const newClaim = await l1PortalManager.bridgeTokensPublic(
        ownerAztecAddress,
        amount,
        false
      );
      setClaim(newClaim);
    } catch (error) {
      toast.error(`Error briding tokens , ${error}`);
      console.log("error briding tokens", error);
    }

    if (!l2TokenContract) return;

    await l2TokenContract.methods
      .mint_to_public(ownerAztecAddress, BigInt(0))
      .send()
      .wait();
    await l2TokenContract.methods
      .mint_to_public(ownerAztecAddress, BigInt(0))
      .send()
      .wait();

    setIsBridging(false);
  };

  const claimBridgedTokensToL2 = async () => {
    if (!l2BridgeContract || !ownerAztecAddress || !claim) {
      toast.error(
        "l2BridgeContract or ownerAztecAddress or claim not found while claiming"
      );
      return;
    }
    try {
      setIsClaiming(true);
      await l2BridgeContract.methods
        .claim_public(
          ownerAztecAddress,
          amount,
          claim.claimSecret,
          claim.messageLeafIndex
        )
        .send()
        .wait();
    } catch (error) {
      toast.error(`Error claiming tokens , ${error}`);
      console.log("error claiming tokens", error);
    } finally {
      setIsClaiming(false);
    }
  };

  return { bridgeTokensToL2, claimBridgedTokensToL2, isBridging, isClaiming };
};
