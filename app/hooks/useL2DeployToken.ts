import { AccountWalletWithSecretKey, AztecAddress } from "@aztec/aztec.js";
import { TokenContract } from "@aztec/noir-contracts.js/Token";
import { useSetAtom } from "jotai";
import { L2TokenContractAtom } from "../atoms";
import { toast } from "sonner";

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
  const setL2TokenContract = useSetAtom(L2TokenContractAtom);

  const deployL2Token = async () => {
    const loadingToastId = toast.loading("Deploying token...", {
      duration: Infinity,
    });

    if (!ownerWallet || !ownerAztecAddress) {
      toast.error("Owner wallet didn't find", { id: loadingToastId });
      return;
    }

    try {
      const L2TokenContract = await TokenContract.deploy(
        ownerWallet,
        ownerAztecAddress,
        tokenName,
        tokenSymbol,
        L2_TOKEN_DECIMALS
      )
        .send()
        .deployed();

      setL2TokenContract(L2TokenContract);

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

  return { deployL2Token };
};
