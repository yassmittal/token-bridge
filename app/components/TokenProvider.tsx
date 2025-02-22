"use client";

import { useAtomValue } from "jotai";
import { useState } from "react";
import { pxeAtom } from "../atoms";

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const pxe = useAtomValue(pxeAtom);

  return <>{children}</>;
};
