import { createClient } from "genlayer-js";
import {
  localnet,
  studionet,
  testnetAsimov,
  testnetBradbury,
} from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { classifyReceipt, type ReceiptLike } from "./transaction-receipt";

type NetworkName =
  | "localnet"
  | "studionet"
  | "testnetAsimov"
  | "testnetBradbury";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const network = (process.env.NEXT_PUBLIC_NETWORK as NetworkName) || "studionet";
const endpoint = process.env.NEXT_PUBLIC_GENLAYER_RPC;
const chainMap = {
  localnet,
  studionet,
  testnetAsimov,
  testnetBradbury,
};

const client = createClient({
  chain: chainMap[network] ?? studionet,
  ...(endpoint ? { endpoint } : {}),
});

type GenLayerRuntimeClient = {
  connect?: (networkName: NetworkName) => Promise<unknown>;
  readContract: (args: {
    address: unknown;
    functionName: string;
    args: unknown[];
  }) => Promise<unknown>;
  writeContract: (args: {
    address: unknown;
    functionName: string;
    args: unknown[];
    value: bigint;
  }) => Promise<string>;
  waitForTransactionReceipt: (args: {
    hash: `0x${string}`;
    status: string;
    interval?: number;
    retries?: number;
    fullTransaction?: boolean;
  }) => Promise<ReceiptLike>;
  getTransaction: (args: { hash: `0x${string}` }) => Promise<ReceiptLike>;
};

export type ContractResult = {
  success: boolean;
  pending?: boolean;
  data?: unknown;
  hash?: string;
  status?: string;
  error?: string;
  verification?: "receipt" | "state_required";
};

function getContractAddress(contractAddress?: string) {
  return contractAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
}

export async function readContract(
  functionName: string,
  args: unknown[] = [],
  contractAddress?: string,
): Promise<ContractResult> {
  try {
    const address = getContractAddress(contractAddress);
    if (!address) {
      return { success: false, error: "Contract address is not configured" };
    }
    const runtimeClient = client as unknown as GenLayerRuntimeClient;
    const data = await runtimeClient.readContract({
      address,
      functionName,
      args,
    });
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Read failed",
    };
  }
}

export async function connectWallet(): Promise<ContractResult> {
  if (typeof window === "undefined" || !window.ethereum) {
    return { success: false, error: "Wallet provider not found" };
  }
  try {
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [],
    })) as string[];
    return { success: true, data: accounts[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Wallet connection failed",
    };
  }
}

export async function writeContract(
  functionName: string,
  args: unknown[] = [],
  contractAddress?: string,
  value: bigint = BigInt(0),
): Promise<ContractResult> {
  if (typeof window === "undefined") {
    return { success: false, error: "Contract writes are only available in the browser" };
  }

  let submittedHash = "";
  let submittedClient: GenLayerRuntimeClient | null = null;
  try {
    const address = getContractAddress(contractAddress);
    if (!address) {
      return { success: false, error: "Contract address is not configured" };
    }

    if (!window.ethereum) {
      return { success: false, error: "Wallet provider not found" };
    }
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [],
    })) as string[];
    const account = accounts[0];
    if (!account) {
      return { success: false, error: "No wallet account selected" };
    }

    const writeClient = createClient({
      chain: chainMap[network] ?? studionet,
      ...(endpoint ? { endpoint } : {}),
      provider: window.ethereum,
      account: account as `0x${string}`,
    });

    const runtimeClient = writeClient as unknown as GenLayerRuntimeClient;
    submittedClient = runtimeClient;
    if (runtimeClient.connect) await runtimeClient.connect(network);
    const hash = await runtimeClient.writeContract({
      address,
      functionName,
      args,
      value,
    });
    submittedHash = hash;

    const receipt = await runtimeClient.waitForTransactionReceipt({
      hash: hash as `0x${string}`,
      status: TransactionStatus.ACCEPTED,
      interval: 2_000,
      retries: 120,
      fullTransaction: false,
    });

    let observedReceipt = receipt;
    if (!observedReceipt.txExecutionResultName) {
      try {
        observedReceipt = await runtimeClient.getTransaction({ hash: hash as `0x${string}` });
      } catch {
        observedReceipt = receipt;
      }
    }

    const decision = classifyReceipt(observedReceipt);
    if (decision.kind === "failure") {
      return {
        success: false,
        hash,
        status: observedReceipt.statusName || receipt.statusName,
        error: decision.reason,
      };
    }

    return {
      success: true,
      hash,
      status: observedReceipt.statusName || receipt.statusName,
      data: observedReceipt.txDataDecoded ?? receipt.txDataDecoded,
      verification: decision.kind === "success" ? "receipt" : "state_required",
    };
  } catch (error) {
    if (submittedHash && submittedClient) {
      try {
        const transaction = await submittedClient.getTransaction({ hash: submittedHash as `0x${string}` });
        const status = transaction.statusName || "PROCESSING";
        if (["PENDING", "PROPOSING", "COMMITTING", "REVEALING", "ACCEPTED"].includes(status)) {
          return {
            success: false,
            pending: true,
            hash: submittedHash,
            status,
            error: `Transaction ${submittedHash} is still ${status}. Do not resubmit; monitor the existing transaction and sync state after consensus.`,
          };
        }
      } catch {
        // Preserve the original SDK error when transaction monitoring is unavailable.
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Write failed",
    };
  }
}
