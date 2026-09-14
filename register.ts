import {
  T3nClient,
  TenantClient,
  getNodeUrl,
  setEnvironment,
  loadWasmComponent,
  fetchTrustedManifest,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
} from "@terminal3/t3n-sdk";
import { readFileSync } from "fs";
import { config } from "dotenv";

config();
setEnvironment("testnet");

const T3N_API_KEY = process.env.T3N_API_KEY!;
const wasmComponent = await loadWasmComponent();
const address = eth_get_address(T3N_API_KEY);

const t3n = new T3nClient({
  trustAnchor: await fetchTrustedManifest("testnet"),
  wasmComponent,
  handlers: { EthSign: metamask_sign(address, undefined, T3N_API_KEY) },
});

await t3n.handshake();
const did = await t3n.authenticate(createEthAuthInput(address));

// 1. Get the Tenant Client (SDK 5.2.0 correct method)
const tenant = new TenantClient({
  t3n: t3n,
  baseUrl: getNodeUrl(),
  tenantDid: did.value,
});

console.log("Uploading contract to Terminal 3...");

// 2. Read the WASM file we just built
const wasmBytes = readFileSync("./z_tenant_flight.wasm");

// 3. Register the contract on the network
const contract = await tenant.contracts.register({
  tail: "enterprise-agent-contract", // T3N uses 'tail' instead of 'name'
  version: "1.0.0",
  wasm: wasmBytes, // T3N uses 'wasm' instead of 'wasmBytes'
});

console.log("✅ Contract successfully registered!");
console.log("Contract ID:", contract.contract_id || contract.id);
