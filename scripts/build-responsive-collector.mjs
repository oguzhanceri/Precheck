import { build } from "esbuild";
import path from "node:path";
import fs from "node:fs/promises";

const root = process.cwd();

const entryPoint = path.join(
  root,
  "src/lib/analyzers/responsive/browser/index.ts",
);

const outfile = path.join(
  root,
  "src/lib/analyzers/responsive/browser/dist/collector.js",
);

await fs.mkdir(path.dirname(outfile), {
  recursive: true,
});

await build({
  entryPoints: [entryPoint],
  outfile,
  bundle: true,
  platform: "browser",
  format: "iife",
  target: "es2020",
});

console.log("Responsive collector build edildi:", outfile);
