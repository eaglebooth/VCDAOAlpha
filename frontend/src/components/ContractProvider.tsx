"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { readContract } from "@/lib/genlayer";

const fallbackAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const storageKey = `vcdao-alpha.contract.${fallbackAddress || "runtime"}`;

type ContractState = {
  address: string;
  fallbackAddress: string;
  overridden: boolean;
  setAddress: (address: string) => void;
  resetAddress: () => void;
};

const ContractContext = createContext<ContractState>({
  address: fallbackAddress,
  fallbackAddress,
  overridden: false,
  setAddress: () => undefined,
  resetAddress: () => undefined,
});

export function isContractAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [address, updateAddress] = useState(fallbackAddress);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) || "";
    if (!isContractAddress(saved) || saved.toLowerCase() === fallbackAddress.toLowerCase()) {
      if (saved && !isContractAddress(saved)) window.localStorage.removeItem(storageKey);
      return;
    }

    let active = true;
    void readContract("get_fund_state", [], saved).then((result) => {
      if (!active) return;
      if (result.success) {
        updateAddress(saved);
        return;
      }
      window.localStorage.removeItem(storageKey);
      updateAddress(fallbackAddress);
    });
    return () => { active = false; };
  }, []);

  const value = useMemo<ContractState>(() => ({
    address,
    fallbackAddress,
    overridden: Boolean(address && address.toLowerCase() !== fallbackAddress.toLowerCase()),
    setAddress(next) {
      const normalized = next.trim();
      if (!isContractAddress(normalized)) return;
      window.localStorage.setItem(storageKey, normalized);
      updateAddress(normalized);
    },
    resetAddress() {
      window.localStorage.removeItem(storageKey);
      updateAddress(fallbackAddress);
    },
  }), [address]);

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
}

export const useContractAddress = () => useContext(ContractContext);
