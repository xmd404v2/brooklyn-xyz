import "dotenv/config";
import { setApiKey, createCoin, DeployCurrency } from "@zoralabs/coins-sdk";
import { Hex, createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { PinataSDK } from "pinata";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import generateImage from "./mint.ts";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import cron from "node-cron";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

// Initialize Pinata client
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

// Validate environment variables
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "PINATA_JWT",
  "GATEWAY_URL",
  "ZORA_KEY",
  "PRIVATE_KEY",
  "WEB_HOOK",
  "FAL_API_KEY",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

let id: string | number | null = null;
let name: string | null = null;
const defaultPrompt =
  "Anime-style cyberpunk female character with dark brown skin, sharp teal eyes, and a confident, determined expression. She wears a high-tech red and black armored exosuit with glowing blue and orange lines, featuring sci-fi straps, connectors, and a compact backpack unit. Large futuristic orange headphones with neon lights cover her ears, with visible cables hanging down. Her hair is tied into a high ponytail, styled in a sleek anime fashion. Her face has small cybernetic implants glowing faintly. The environment is a vibrant, stylized cyberpunk city at night — filled with exaggerated teal and orange neon signs, floating holograms, glowing advertisements, and tall angular buildings in the distance. The background is slightly blurred with soft anime lighting effects and bokeh-style lights. The entire scene is illustrated in a bold, cel-shaded anime/cartoon art style, not realistic — with clean outlines, vivid colors, and dramatic lighting contrast.";

// Discord webhook function
async function sendDiscordNotification(message: string, isError: boolean = false) {
  try {
    const webhookUrl = process.env.WEB_HOOK!;
    const embed = {
      title: isError ? "❌ NFT Deployment Failed" : "✅ NFT Deployment Success",
      description: message,
      color: isError ? 0xff0000 : 0x00ff00,
      timestamp: new Date().toISOString(),
      footer: { text: "NFT Bot" },
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      console.error("❌ Discord webhook failed:", response.status, response.statusText);
    } else {
      console.log("✅ Discord notification sent");
    }
  } catch (error) {
    console.error("❌ Discord notification error:", error);
  }
}

async function uploadImageToIPFS(filePathOrUrl: string): Promise<string> {
  console.log("Uploading:", filePathOrUrl);
  try {
    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType = "image/png";

    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
      const response = await fetch(filePathOrUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      const urlPath = new URL(filePathOrUrl).pathname;
      fileName = path.basename(urlPath) || "image.png";
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("webp") || fileName.endsWith(".webp")) {
        fileBuffer = await sharp(fileBuffer).jpeg().toBuffer();
        fileName = fileName.replace(/\.webp$/, "") + ".jpg";
        mimeType = "image/jpeg";
      } else if (contentType.includes("jpeg")) {
        mimeType = "image/jpeg";
      } else if (contentType.includes("png")) {
        mimeType = "image/png";
      } else if (contentType.includes("gif")) {
        mimeType = "image/gif";
      }
    } else {
      fileBuffer = fs.readFileSync(filePathOrUrl);
      fileName = path.basename(filePathOrUrl);
      if (fileName.endsWith(".webp")) {
        fileBuffer = await sharp(fileBuffer).jpeg().toBuffer();
        fileName = fileName.replace(/\.webp$/, "") + ".jpg";
        mimeType = "image/jpeg";
      }
    }

    const file = new File([fileBuffer], fileName, { type: mimeType });
    const upload = await pinata.upload.public.file(file);
    console.log("✅ Image uploaded to IPFS:");
    console.log("CID:", upload.cid);
    console.log("Gateway:", `https://gateway.pinata.cloud/ipfs/${upload.cid}`);
    return upload.cid;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
}

interface NFTData {
  id?: number | string;
  name: string;
  description: string;
  nft_ipfshash: string;
}

async function getNextPendingNFT(): Promise<NFTData | null> {
  const { data, error } = await supabase
    .from("nft_queue")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      console.log("📭 No pending NFTs in queue");
      const nft_url = await generateImage(defaultPrompt);
      const ipfs = await uploadImageToIPFS(nft_url);
      const defaultNFT: NFTData = {
        id: uuidv4(),
        name: "Brooklyn",
        description: "Brooklyn replicate.",
        nft_ipfshash: ipfs,
      };
      // Insert default NFT into nft_queue to satisfy NOT NULL constraint
      await supabase.from("nft_queue").insert({
        id: defaultNFT.id,
        name: defaultNFT.name,
        description: defaultNFT.description,
        nft_ipfshash: defaultNFT.nft_ipfshash,
        status: "pending",
        created_at: new Date().toISOString(),
      });
      return defaultNFT;
    }
    throw error;
  }

  return data;
}

async function updateNFTStatus(id: number | string, status: string, updates: any = {}) {
  const { error } = await supabase
    .from("nft_queue")
    .upsert({ id, status, name: updates.name || "Brooklyn", ...updates }, { onConflict: ["id"] });

  if (error) throw error;
}

async function deployNFT(nftData: NFTData) {
  const ipfsHash = nftData.nft_ipfshash;

  const metadata = {
    name: nftData.name,
    description: nftData.description,
    image: `ipfs://${ipfsHash}`,
    properties: { category: "social" },
  };

  const metadataUpload = await pinata.upload.public.json(metadata);
  const metadataCid = metadataUpload.cid;

  console.log("✅ Metadata uploaded to IPFS:");
  console.log("Metadata CID:", metadataCid);

  setApiKey(process.env.ZORA_KEY!);
  const privateKey = `0x${process.env.PRIVATE_KEY!}` as Hex;
  const account = privateKeyToAccount(privateKey);

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
    name: nftData.name,
    symbol: "BRKLYN",
    uri: `ipfs://${metadataCid}`,
    payoutRecipient: walletClient.account.address as Address,
    chainId: baseSepolia.id,
    currency: DeployCurrency.ETH,
  };

  const result = await createCoin(coinParams, walletClient, publicClient, {
    gasMultiplier: 120,
  });

  console.log("✅ Transaction hash:", result.hash);
  console.log("✅ Coin address:", result.address);
  console.log("📦 Deployment details:", result.deployment);

  return result;
}

async function main() {
  try {
    const nftData = await getNextPendingNFT();
    id = nftData?.id || uuidv4();
    name = nftData?.name || "Brooklyn";

    if (!nftData) {
      console.log("No pending NFTs to process");
      return;
    }

    console.log(`Processing: ${nftData.name}`);
    await updateNFTStatus(id, "processing", nftData);

    let result;
    let lastError;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Deployment attempt ${attempt}/${maxRetries}`);
        result = await deployNFT(nftData);
        break;
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          const delay = attempt * 2000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (!result) {
      throw lastError;
    }

    await updateNFTStatus(id, "completed", {
      tx: result.hash,
      coin: result.address,
      posted_at: new Date().toISOString(),
      ...nftData,
    });

    const successMessage =
      `**${nftData.name}** deployed successfully!\n\n` +
      `🔗 **Transaction:** [${result.hash}](https://sepolia.basescan.org/tx/${result.hash})\n` +
      `🪙 **Coin Address:** \`${result.address}\`\n` +
      `📝 **Description:** ${nftData.description}\n` +
      `🖼️ **Image:** [View on IPFS](https://gateway.pinata.cloud/ipfs/${nftData.nft_ipfshash})`;

    await sendDiscordNotification(successMessage, false);

    return result;
  } catch (error) {
    console.error("❌ Error:", error);

    try {
      await updateNFTStatus(id!, "failed", {
        name: name || "Brooklyn",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
    }

    const errorMessage =
      `**${name || "Brooklyn"}** deployment failed after 3 attempts!\n\n` +
      `❌ **Error:** ${error instanceof Error ? error.message : "Unknown error"}\n` +
      `⏰ **Time:** ${new Date().toLocaleString()}`;

    await sendDiscordNotification(errorMessage, true);

    throw error;
  }
}

// Run immediately and schedule daily at 00:05 UTC
main();
cron.schedule("5 0 * * *", main, { scheduled: true, timezone: "Etc/UTC" });