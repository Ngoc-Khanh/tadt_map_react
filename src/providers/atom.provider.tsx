import { Provider } from "jotai";
import type { ReactNode } from "react";

interface AtomsProviderProps {
  children: ReactNode
}

export default function AtomsProvider({ children }: AtomsProviderProps) {
  return <Provider>{children}</Provider>
}