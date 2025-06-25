import "dotenv/config";
import { setApiKey, createCoin, DeployCurrency } from "@zoralabs/coins-sdk";
import { Hex, createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { PinataSDK } from "pinata";
import fs from 'fs';
import path from 'path';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
});

async function uploadImageToIPFS(filePath: string) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    // Create a File-like object that's compatible with Pinata
    const file = new File([fileBuffer], fileName, { 
      type: "image/png" // Use appropriate MIME type for your image
    });
    
    const upload = await pinata.upload.public.file(file);
    console.log('✅ Image uploaded to IPFS:');
    console.log('CID:', upload.cid);
    console.log('Gateway:', `https://gateway.pinata.cloud/ipfs/${upload.cid}`);
    return upload.cid;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

async function main() {
  try {
    // Upload image first and wait for it to complete
    const imagePath = path.join(__dirname, 'images/1.png');
    const ipfsHash = await uploadImageToIPFS(imagePath);
    
    // Create metadata object with the IPFS hash
    const metadata = {
      name: "vr",
      description: "3d vr headset",
      image: `ipfs://${ipfsHash}`, // Use proper IPFS URI format
      properties: {
        category: "social"
      }
    };
    
    // Upload metadata to IPFS
    const metadataUpload = await pinata.upload.public.json(metadata);
    const metadataCid = metadataUpload.cid;
    
    console.log('✅ Metadata uploaded to IPFS:');
    console.log('Metadata CID:', metadataCid);
    
    // Set up Zora SDK
    setApiKey(process.env.ZORA_KEY!);
    
    const privateKey = `0x${process.env.PRIVATE_KEY!}`;
    const account = privateKeyToAccount(privateKey as Address);
    console.log(account);
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http("https://base-mainnet.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF"),
    });
    
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http("https://base-mainnet.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF"),
    });
    
    const coinParams = {
      name: "Brooklyn",
      symbol: "BRKLN",
      uri: `ipfs://${metadataCid}`, // Use proper IPFS URI format
      payoutRecipient: "0xC27d4CcC62E64791c5B321C38E2aF647F091ddf5" as Address,
      chainId: base.id,
      currency: DeployCurrency.ETH,
    };
    
    // Create the coin
    const result = await createCoin(coinParams, walletClient, publicClient, {
      gasMultiplier: 120,
    });
    
    console.log("✅ Transaction hash:", result.hash);
    console.log("✅ Coin address:", result.address);
    console.log("📦 Deployment details:", result.deployment);
    
    return result;
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Run the main function
main();