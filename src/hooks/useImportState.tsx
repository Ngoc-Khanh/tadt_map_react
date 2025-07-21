import { importOpenAtom } from "@/stores";
import { useAtom } from "jotai";

export const useImportState = () => {
  const [isImporting, setIsImporting] = useAtom(importOpenAtom);

  const openImport = () => setIsImporting(true);
  const closeImport = () => setIsImporting(false);

  return { isImporting, openImport, closeImport };
}