import fs from "node:fs/promises";
import path from "node:path";

let cachedCollectorScript: string | null = null;

export async function createCollectorScript() {
  if (cachedCollectorScript) {
    return cachedCollectorScript;
  }

  const scriptPath = path.join(
    process.cwd(),
    "src/lib/analyzers/responsive/browser/dist/collector.js",
  );

  try {
    cachedCollectorScript = await fs.readFile(scriptPath, "utf-8");
  } catch {
    throw new Error(
      "Responsive collector script bulunamadı. Lütfen önce `npm run build:responsive-collector` çalıştırın.",
    );
  }

  if (!cachedCollectorScript.trim()) {
    throw new Error("Responsive collector script boş görünüyor.");
  }

  return cachedCollectorScript;
}