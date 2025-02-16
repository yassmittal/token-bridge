import { useEffect, useState } from "react";
import { atom, useAtom, useAtomValue } from "jotai";
import { TokenContract } from "@aztec/noir-contracts.js/Token";
import { createL1Clients, deployL1Contract } from "@aztec/ethereum";
import { TestERC20Abi, TestERC20Bytecode } from "@aztec/l1-artifacts";
import { L1TokenManager } from "@aztec/aztec.js";
import { currentWalletAtom, pxeAtom } from "../atoms";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { createLogger } from "@aztec/aztec.js";

// Store deployed addresses in localStorage
const STORAGE_KEY = "deployed_token_addresses";

// Create L1 clients outside component
const { walletClient, publicClient } = createL1Clients(
  "http://localhost:8545",
  "test test test test test test test test test test test junk"
);

export type TokenInfo = {
  ethToken: {
    address: string;
    balance: bigint;
  } | null;
  aztecToken: {
    address: string;
    balance: bigint;
  } | null;
};

export const tokenInfoAtom = atom<TokenInfo>({
  ethToken: null,
  aztecToken: null,
});

export const TokenSetup = ({ children }: { children: React.ReactNode }) => {
  const pxe = useAtomValue(pxeAtom);
  const currentWallet = useAtomValue(currentWalletAtom);
  const [tokenInfo, setTokenInfo] = useAtom(tokenInfoAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logger = createLogger("token-setup");

  useEffect(() => {
    const setupTokens = async () => {
      if (!pxe || !currentWallet) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if we have stored addresses
        const storedAddresses = localStorage.getItem(STORAGE_KEY);
        let ethTokenAddress;
        let aztecTokenContract;

        if (storedAddresses) {
          const addresses = JSON.parse(storedAddresses);
          ethTokenAddress = addresses.ethToken;

          // Reconnect to existing Aztec token
          if (addresses.aztecToken) {
            aztecTokenContract = await TokenContract.at(
              addresses.aztecToken,
              currentWallet
            );
          }
        }

        // If no ETH token, deploy it
        if (!ethTokenAddress) {
          ethTokenAddress = await deployL1Contract(
            walletClient,
            publicClient,
            TestERC20Abi,
            TestERC20Bytecode,
            ["ETH Test Token", "ETEST", walletClient.account.address]
          ).then(({ address }) => address);

          console.log("ETH token deployed at:", ethTokenAddress);
        }

        // Create token manager
        const l1TokenManager = new L1TokenManager(
          ethTokenAddress,
          publicClient,
          walletClient,
          logger
        );

        // Check balance and mint if needed
        const beforeMintBal = await l1TokenManager.getL1TokenBalance(
          walletClient.account.address
        );
        console.log("Balance before minting:", beforeMintBal.toString());

        if (beforeMintBal === 0n) {
          logger.info("Minting 300 tokens for", walletClient.account.address);
          await l1TokenManager.mint(BigInt(300), walletClient.account.address);
        }

        const afterMintBal = await l1TokenManager.getL1TokenBalance(
          walletClient.account.address
        );
        console.log("Balance after minting:", afterMintBal.toString());

        // If no Aztec token, deploy it
        if (!aztecTokenContract) {
          aztecTokenContract = await TokenContract.deploy(
            currentWallet,
            currentWallet.getAddress(),
            "Aztec Test Token",
            "ATEST",
            18
          )
            .send()
            .deployed();

          console.log(
            "Aztec token deployed at:",
            aztecTokenContract.address.toString()
          );
        }

        // Check Aztec balance and mint if needed
        const aztecBalance = await aztecTokenContract.methods
          .balance_of_public(currentWallet.getAddress())
          .simulate();

        if (aztecBalance === 0n) {
          await aztecTokenContract.methods
            .mint_to_public(currentWallet.getAddress(), 100n)
            .send()
            .wait();
        }

        // Store addresses
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ethToken: ethTokenAddress.toString(),
            aztecToken: aztecTokenContract.address.toString(),
          })
        );

        // Update token info
        const finalAztecBalance = await aztecTokenContract.methods
          .balance_of_public(currentWallet.getAddress())
          .simulate();

        setTokenInfo({
          ethToken: {
            address: ethTokenAddress.toString(),
            balance: afterMintBal,
          },
          aztecToken: {
            address: aztecTokenContract.address.toString(),
            balance: finalAztecBalance,
          },
        });
      } catch (error) {
        console.error("Token setup failed:", error);
        setError(
          error instanceof Error ? error.message : "Failed to setup tokens"
        );
      } finally {
        setIsLoading(false);
      }
    };

    setupTokens();
  }, [pxe, currentWallet]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Setting up tokens...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
