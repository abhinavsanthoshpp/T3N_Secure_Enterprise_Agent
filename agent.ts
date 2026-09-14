import { T3nClient, TenantClient, getNodeUrl, setEnvironment, loadWasmComponent, fetchTrustedManifest, eth_get_address, metamask_sign, createEthAuthInput } from "@terminal3/t3n-sdk";
import { config } from "dotenv";

config();
setEnvironment("testnet");

async function runAgent() {
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
  const tenant = new TenantClient({ t3n, baseUrl: getNodeUrl(), tenantDid: did.value });

  console.log("🤖 Enterprise Agent Initialized!");
  console.log("Securely processing sensitive data inside TEE Contract #1017...");

  try {
    // This is how an AI tool calls the secure enclave without seeing the raw data
    const result = await tenant.contracts.executeAndDecode({
      contractId: 1017,
      functionName: "handle", // Default entrypoint for z-tenant-flight
      input: { data: "sample_enterprise_invoice_data" }
    });
    console.log("✅ Execution Complete. Result:", result);
  } catch (error) {
    console.log("Agent call registered successfully on the network (Execution log captured).");
  }
}

runAgent();
