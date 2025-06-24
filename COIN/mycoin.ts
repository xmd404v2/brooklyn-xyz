import "dotenv/config";
import { setApiKey, createCoin, DeployCurrency } from "@zoralabs/coins-sdk";
import { Hex, createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains"

setApiKey(process.env.ZORA_KEY!);

const privateKey = `0x${process.env.PRIVATE_KEY!}`;
const account = privateKeyToAccount(privateKey as Address);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://base-sepolia.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF"),
});

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http("https://base-sepolia.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF"),
});

const coinParams = {
  name: "Brooklyn",
  symbol: "BRKLN",
  uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy",
  payoutRecipient: "0xC27d4CcC62E64791c5B321C38E2aF647F091ddf5" as Address,
  chainId: baseSepolia.id,
  currency: DeployCurrency.ETH,
};

async function createMyCoin() {
  try {
    const result = await createCoin(coinParams, walletClient, publicClient, {
      gasMultiplier: 120,
    });

    console.log("✅ Transaction hash:", result.hash);
    console.log("✅ Coin address:", result.address);
    console.log("📦 Deployment details:", result.deployment);
    return result;
  } catch (error) {
    console.error("❌ Error creating coin:", error);
    throw error;
  }
}

createMyCoin();
