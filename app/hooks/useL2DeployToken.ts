import { AccountWalletWithSecretKey, AztecAddress } from "@aztec/aztec.js";
import { TokenContract } from "@aztec/noir-contracts.js/Token";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  l1PortalContractAddressAtom,
  l1PortalManagerAtom,
  l2BridgeContractAtom,
  l2TokenContractAtom,
} from "../atoms";
import { toast } from "sonner";
import { TokenBridgeContract } from "@aztec/noir-contracts.js/TokenBridge";

const L2_TOKEN_DECIMALS = 18;

type DeployTokenType = {
  ownerWallet: AccountWalletWithSecretKey | null;
  ownerAztecAddress: AztecAddress | undefined;
  tokenName: string;
  tokenSymbol: string;
};

export const useDeployL2Token = ({
  ownerWallet,
  ownerAztecAddress,
  tokenName,
  tokenSymbol,
}: DeployTokenType) => {
  const [l2TokenContract, setL2TokenContract] = useAtom(l2TokenContractAtom);
  const l1PortalContractAddress = useAtomValue(l1PortalContractAddressAtom);
  const setL2BridgeContract = useSetAtom(l2BridgeContractAtom);
  const l2TokenContractFromAtom = useAtomValue(l2TokenContractAtom);

  const deployL2Token = async () => {
    const loadingToastId = toast.loading("Deploying token...", {
      duration: Infinity,
    });

    if (!ownerWallet || !ownerAztecAddress) {
      toast.error("Owner wallet didn't find", { id: loadingToastId });
      return;
    }

    try {
      const l2TokenContract = await TokenContract.deploy(
        ownerWallet,
        ownerAztecAddress,
        tokenName,
        tokenSymbol,
        L2_TOKEN_DECIMALS
      )
        .send()
        .deployed();

      console.log("l2TokenContract in use l2 deploy file", l2TokenContract);

      setL2TokenContract(l2TokenContract);

      toast.success("Token Deployed Successfully", {
        id: loadingToastId,
      });
    } catch (error) {
      console.log("error deploying l2 token contract", error);
      toast.error("Failed to deploy token, Please try again", {
        id: loadingToastId,
      });
    }
  };

  const deployL2BridgeContract = async () => {
    if (
      !ownerWallet ||
      !l1PortalContractAddress ||
      !l2TokenContractFromAtom ||
      !l2TokenContract
    ) {
      toast.error(
        "Owner wallet or l1 Portal Contract Address or l2TokenContract didn't find"
      );
      return;
    }

    console.log(
      "l2TokenContractFromAtom in use l2 deploy file",
      l2TokenContractFromAtom
    );

    try {
      const l2BridgeContract = await TokenBridgeContract.deploy(
        ownerWallet,
        l2TokenContractFromAtom.address,
        l1PortalContractAddress
      )
        .send()
        .deployed();

      // authorize the L2 bridge contract to mint tokens on the L2 token contract
      await l2TokenContract.methods
        .set_minter(l2BridgeContract.address, true)
        .send()
        .wait();

      setL2BridgeContract(l2BridgeContract);
    } catch (error) {
      console.log("error deploying l2 bridge contract", error);
    }
  };

  return { deployL2Token, deployL2BridgeContract };
};
