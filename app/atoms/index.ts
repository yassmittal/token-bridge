import { atom } from "jotai";
import {
  AccountWalletWithSecretKey,
  EthAddress,
  L1TokenManager,
  L1TokenPortalManager,
  PXE,
} from "@aztec/aztec.js";
import { PayTransactionFull } from "../types";
import { NFTContract } from "@aztec/noir-contracts.js/NFT";
import { TokenContract } from "@aztec/noir-contracts.js/Token";
import { TokenBridgeContract } from "@aztec/noir-contracts.js/TokenBridge";

// Existing PXE atom
export const pxeAtom = atom<PXE | null>(null);
export const walletsAtom = atom<AccountWalletWithSecretKey[]>([]);

// Current wallet atom
export const currentWalletAtom = atom<AccountWalletWithSecretKey | null>(null);
export const currentTokenContractAtom = atom<TokenContract | null>(null);
export const tokenContractsAtom = atom<TokenContract[]>([]);
export const publicBalanceAtom = atom<bigint>(BigInt(0));
export const privateBalanceAtom = atom<bigint>(BigInt(0));

export const payTransactionsAtom = atom<PayTransactionFull[]>([]);

export const isPrivateAtom = atom<boolean>(false);
export const rpcUrlAtom = atom<string>("");
export const remountKeyAtom = atom<number>(0);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const walletSDKAtom = atom<any>(null);
export const nftContractAtom = atom<NFTContract | null>(null);

export const l2TokenContractAtom = atom<TokenContract | null>(null);
export const l1TokenContractAddressAtom = atom<EthAddress | null>(null);
export const l1TokenManagerAtom = atom<L1TokenManager | null>(null);

export const l1PortalContractAddressAtom = atom<EthAddress | null>(null);
export const l1PortalAtom = atom<unknown>(null);

export const l2BridgeContractAtom = atom<TokenBridgeContract | null>(null);
export const l1PortalManagerAtom = atom<L1TokenPortalManager | null>(null);
