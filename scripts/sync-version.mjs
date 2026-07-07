import { readFileSync, writeFileSync } from "fs";

const version = JSON.parse(readFileSync("package.json", "utf8")).version;

// Sync tauri.conf.json
const tauriConfPath = "src-tauri/tauri.conf.json";
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf8"));
tauriConf.version = version;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");

// Sync Cargo.toml (first [package] version = "...")
const cargoPath = "src-tauri/Cargo.toml";
const cargo = readFileSync(cargoPath, "utf8");
writeFileSync(
  cargoPath,
  cargo.replace(/^version = "[\d.]+"/m, `version = "${version}"`),
);

console.log(`✓ synced ${version} → tauri.conf.json, Cargo.toml`);
