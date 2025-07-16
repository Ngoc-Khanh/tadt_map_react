import { useImportState } from "@/hooks/useImportState";

export function ProjectImporting() {
  const { closeImport } = useImportState();
  
  return (
    <div>
      <h2>Importing Project Data</h2>
      <button onClick={closeImport}>Close</button>
    </div>
  )
}