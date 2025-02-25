"use client";

import { createPXEClient, waitForPXE } from "@aztec/aztec.js";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { pxeAtom, walletSDKAtom } from "../atoms";
import { RPC_URL } from "../constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PXELoadingScreen } from "./PXELoadingScreen";
import { ReownPopupWalletSdk } from "@shieldswap/wallet-sdk";

export const PxeProvider = ({ children }: { children: React.ReactNode }) => {
  const setPXEClient = useSetAtom(pxeAtom);
  const setWalletSDK = useSetAtom(walletSDKAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePXE = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const pxeClient = createPXEClient(RPC_URL);
        await waitForPXE(pxeClient);
        setPXEClient(pxeClient);
        console.log("PXE client initialized successfully");
        const walletSdk = new ReownPopupWalletSdk(pxeClient, {
          projectId: "ea460b58f93f44c50993ce1f67e6cee8",
        });
        setWalletSDK(walletSdk);
        console.log("Wallet SDK instantiated successfully");
      } catch (error) {
        console.error("Failed to initialize PXE client:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to connect to PXE client"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializePXE();
  }, [setPXEClient]);

  if (isLoading) {
    return <PXELoadingScreen />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to initialize PXE client: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
