'use client'
import { useAtomValue } from 'jotai'
import { currentWalletAtom, pxeAtom } from './atoms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { PopupWalletSdk } from '@shieldswap/wallet-sdk'

export default function Home() {
  const currentWallet = useAtomValue(currentWalletAtom)
  const pxe = useAtomValue(pxeAtom)
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState('')

  // useEffect(() => {
  //   const loadWalletSdk = async () => {
  //     const walletSdk = new PopupWalletSdk(pxe!);
  //     const wallet = await walletSdk.getAccount();
  //     console.log("walletSdk from main page", walletSdk);
  //     console.log("wallet from main page", wallet);
  //   };

  //   loadWalletSdk();
  // }, [pxe]);

  const currentWalletAddress = currentWallet?.getAddress()

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Token Balances Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between p-4 bg-muted rounded-lg">
              <span>Ethereum (ETEST)</span>
              <span className="font-mono">100 ETEST</span>
            </div>
            <div className="flex justify-between p-4 bg-muted rounded-lg">
              <span>Aztec (ATEST)</span>
              <span className="font-mono">100 ATEST</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bridge Card */}
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

            {/* ETH to Aztec */}
            <TabsContent value="eth-to-aztec">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Available to Bridge:</span>
                    <span className="font-mono">100 ETEST</span>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Amount to bridge"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      max="100"
                    />
                    <Button className="w-full" disabled={isLoading || !amount}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Bridging...
                        </>
                      ) : (
                        'Bridge to Aztec'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Aztec to ETH */}
            <TabsContent value="aztec-to-eth">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Available to Bridge:</span>
                    <span className="font-mono">100 ATEST</span>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Amount to bridge"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      max="100"
                    />
                    <Button className="w-full" disabled={isLoading || !amount}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Bridging...
                        </>
                      ) : (
                        'Bridge to Ethereum'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
