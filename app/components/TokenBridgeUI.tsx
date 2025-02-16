"use client";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDownIcon, ArrowUpIcon, Loader2 } from "lucide-react";
import { currentWalletAtom } from "../atoms";
import { tokenInfoAtom } from "../components/TokenSetup";

const TokenBridgeUI = () => {
  const currentWallet = useAtomValue(currentWalletAtom);
  const tokenInfo = useAtomValue(tokenInfoAtom);
  const [amount, setAmount] = useState("");
  const [isBridging, setIsBridging] = useState(false);

  if (!currentWallet) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>Please connect your wallet first</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!tokenInfo.ethToken || !tokenInfo.aztecToken) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>
            Waiting for tokens to be initialized...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Token Balances */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  ETH Test Tokens (ETEST)
                </span>
                <span className="font-mono">
                  {tokenInfo.ethToken.balance.toString()} ETEST
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Contract: {tokenInfo.ethToken.address}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Aztec Test Tokens (ATEST)
                </span>
                <span className="font-mono">
                  {tokenInfo.aztecToken.balance.toString()} ATEST
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Contract: {tokenInfo.aztecToken.address}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bridge Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Bridge Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="eth-to-aztec" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="eth-to-aztec">
                <div className="flex items-center gap-2">
                  <ArrowDownIcon className="w-4 h-4" />
                  ETH → Aztec
                </div>
              </TabsTrigger>
              <TabsTrigger value="aztec-to-eth">
                <div className="flex items-center gap-2">
                  <ArrowUpIcon className="w-4 h-4" />
                  Aztec → ETH
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="eth-to-aztec">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to bridge"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={tokenInfo.ethToken.balance.toString()}
                    disabled={isBridging}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {tokenInfo.ethToken.balance.toString()} ETEST
                  </p>
                </div>
                <Button
                  className="w-full"
                  disabled={isBridging || !amount || amount === "0"}
                  onClick={() => {
                    // Bridge functionality will be added here
                  }}
                >
                  {isBridging ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Bridging...
                    </>
                  ) : (
                    "Bridge to Aztec"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="aztec-to-eth">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to bridge"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={tokenInfo.aztecToken.balance.toString()}
                    disabled={isBridging}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {tokenInfo.aztecToken.balance.toString()} ATEST
                  </p>
                </div>
                <Button
                  className="w-full"
                  disabled={isBridging || !amount || amount === "0"}
                  onClick={() => {
                    // Bridge functionality will be added here
                  }}
                >
                  {isBridging ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Bridging...
                    </>
                  ) : (
                    "Bridge to Ethereum"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenBridgeUI;
