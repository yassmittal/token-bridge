import {
  createLogger,
  deployL1Contract,
  L1TokenManager,
  L1TokenPortalManager,
} from "@aztec/aztec.js";
import { createL1Clients } from "@aztec/ethereum";
import {
  TestERC20Abi,
  TestERC20Bytecode,
  TokenPortalAbi,
  TokenPortalBytecode,
} from "@aztec/l1-artifacts";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  l1PortalAtom,
  l1PortalContractAddressAtom,
  l1PortalManagerAtom,
  l1TokenContractAddressAtom,
  l1TokenManagerAtom,
  l2BridgeContractAtom,
  pxeAtom,
} from "../atoms";
import { getContract } from "viem";
import { toast } from "sonner";

const mnemonic = "test test test test test test test test test test test junk";

const { ETHEREUM_HOST = "http://localhost:8545" } = process.env;
const { walletClient, publicClient } = createL1Clients(ETHEREUM_HOST, mnemonic);

const ownerEthAddress = walletClient.account.address;

type L1DeployTokenType = {
  tokenName: string;
  tokenSymbol: string;
};

export const useL1DeployToken = ({
  tokenName,
  tokenSymbol,
}: L1DeployTokenType) => {
  const [l1TokenContractAddress, setl1TokenContractAddressAtom] = useAtom(
    l1TokenContractAddressAtom
  );
  const setl1TokenManagerAtom = useSetAtom(l1TokenManagerAtom);
  const [l1PortalContractAddress, setL1PortalContractAddress] = useAtom(
    l1PortalContractAddressAtom
  );
  const [l1Portal, setl1Portal] = useAtom(l1PortalAtom);
  const pxe = useAtomValue(pxeAtom);
  const logger = createLogger("aztec:token-bridge-tutorial");
  const l2BridgeContract = useAtomValue(l2BridgeContractAtom);
  const setL1PortalManagerAtom = useSetAtom(l1PortalManagerAtom);

  const deployL1Token = async () => {
    try {
      const l1TokenContractAddress = await deployL1Contract(
        walletClient,
        publicClient,
        TestERC20Abi,
        TestERC20Bytecode,
        [tokenName, tokenSymbol, ownerEthAddress]
      ).then(({ address }) => address);

      setl1TokenContractAddressAtom(l1TokenContractAddress);

      const l1TokenManager = new L1TokenManager(
        l1TokenContractAddress,
        publicClient,
        walletClient,
        logger
      );

      setl1TokenManagerAtom(l1TokenManager);
    } catch (error) {
      console.log("error", error);
    }
  };

  const deployTokenPortal = async () => {
    try {
      const l1PortalContractAddress = await deployL1Contract(
        walletClient,
        publicClient,
        TokenPortalAbi,
        TokenPortalBytecode,
        []
      ).then(({ address }) => address);

      const l1Portal = getContract({
        address: l1PortalContractAddress.toString(),
        abi: TokenPortalAbi,
        client: walletClient,
      });

      setL1PortalContractAddress(l1PortalContractAddress);
      setl1Portal(l1Portal);
    } catch (error) {
      console.log("error", error);
    }
  };

  const initializeL1PortalManager = async () => {
    if (
      !pxe ||
      !l1TokenContractAddress ||
      !l2BridgeContract ||
      !l1PortalContractAddress
    ) {
      toast.error(
        "pxe or l1 Token Contract Address or  l2BridgeContract not found"
      );
      return;
    }

    const l1ContractAddresses = (await pxe.getNodeInfo()).l1ContractAddresses;

    await l1Portal.write.initialize(
      [
        l1ContractAddresses.registryAddress.toString(),
        l1TokenContractAddress.toString(),
        l2BridgeContract.address.toString(),
      ],
      {}
    );

    logger.info("L1 portal contract initialized");

    const l1PortalManager = new L1TokenPortalManager(
      l1PortalContractAddress,
      l1TokenContractAddress,
      l1ContractAddresses.outboxAddress,
      publicClient,
      walletClient,
      logger
    );

    setL1PortalManagerAtom(l1PortalManager);
  };

  return {
    deployL1Token,
    deployTokenPortal,
    initializeL1PortalManager,
    ownerEthAddress,
  };
};
