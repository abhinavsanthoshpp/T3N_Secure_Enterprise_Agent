import {
  T3nClient,
  setEnvironment,
  loadWasmComponent,
  fetchTrustedManifest,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
} from "@terminal3/t3n-sdk";
import { readFileSync } from "fs";
import { config } from "dotenv";

// Load the secret key from the .env file
config();

// 1. Point to the T3N Testnet
setEnvironment("testnet");

const T3N_API_KEY = process.env.T3N_API_KEY!;

// 2. Load the cryptography module & format the address
const wasmComponent = await loadWasmComponent();
const address = eth_get_address(T3N_API_KEY);

// 3. Configure the client and check the Trusted Enclave Manifest
const t3n = new T3nClient({
  trustAnchor: await fetchTrustedManifest("testnet"),
  wasmComponent,
  handlers: {
    EthSign: metamask_sign(address, undefined, T3N_API_KEY),
  },
});

// 4. Connect and authenticate!
console.log("Connecting to T3N...");
await t3n.handshake();
const did = await t3n.authenticate(createEthAuthInput(address));
const tenantDid = did.value;

console.log("✅ Successfully connected as:", tenantDid);
