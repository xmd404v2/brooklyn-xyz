import "dotenv/config";
import { setApiKey, createCoin, DeployCurrency } from "@zoralabs/coins-sdk";
import { Hex, createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { PinataSDK } from "pinata";
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import generateImage from "./mint";
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
});

let id = null;
let name = null;

// Neynar API configuration
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

// Farcaster posting function using Neynar
async function postToFarcaster(nftData: any, deploymentResult: any) {
  if (!NEYNAR_API_KEY || !NEYNAR_SIGNER_UUID) {
    console.log('⚠️ Neynar API key or signer UUID not configured, skipping Farcaster post');
    return null;
  }

  try {
    console.log('📱 Posting to Farcaster...');
    
    // Create the cast text
    const castText = `Day ${nftData.day}: ${nftData.title}\n\n${nftData.prompt}\n\n🔗 Mint: https://testnet.zora.co/coin/bsep:${deploymentResult.address}\n\n`;
    
    // Create the cast payload
    const castPayload = {
      signer_uuid: NEYNAR_SIGNER_UUID,
      text: castText,
      ...(`https://gateway.pinata.cloud/ipfs/${nftData.nft_ipfshash}` && { 
        embeds: [{ url: `https://gateway.pinata.cloud/ipfs/${nftData.nft_ipfshash}` }] 
      })
    };
    
    console.log('📝 Cast payload:', castPayload);
    
    // Post the cast
    const castResponse = await fetch('https://api.neynar.com/v2/farcaster/cast', {
      method: 'POST',
      headers: {
        'x-api-key': `${NEYNAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(castPayload),
    });
    
    if (!castResponse.ok) {
      const errorText = await castResponse.text();
      throw new Error(`Neynar API error: ${castResponse.status} - ${errorText}`);
    }
    
    const castData = await castResponse.json();
    console.log('✅ Posted to Farcaster successfully!');
    console.log('Cast hash:', castData.cast.hash);
    console.log('Cast URL:', `https://warpcast.com/${castData.cast.author.username}/${castData.cast.hash}`);
    
    return {
      hash: castData.cast.hash,
      url: `https://warpcast.com/${castData.cast.author.username}/${castData.cast.hash}`,
      author: castData.cast.author.username
    };
    
  } catch (error) {
    console.error('❌ Failed to post to Farcaster:', error);
    throw error;
  }
}

// Discord webhook function
async function sendDiscordNotification(message: string, isError: boolean = false) {
  try {
    const webhookUrl = process.env.WEB_HOOK;
    if (!webhookUrl) {
      console.log('⚠️ Discord webhook URL not configured');
      return;
    }

    const embed = {
      title: isError ? "❌ NFT Deployment Failed" : "✅ NFT Deployment Success",
      description: message,
      color: isError ? 0xFF0000 : 0x00FF00, // Red for error, Green for success
      timestamp: new Date().toISOString(),
      footer: {
        text: "NFT Bot"
      }
    };

    const payload = {
      embeds: [embed]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('❌ Discord webhook failed:', response.status, response.statusText);
    } else {
      console.log('✅ Discord notification sent');
    }
  } catch (error) {
    console.error('❌ Discord notification error:', error);
  }
}


async function uploadImageToIPFS(filePathOrUrl: string) {
  console.log("linkkk: ", filePathOrUrl);
  try {
    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType = "image/png";

    // Check if input is a URL
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
      const response = await fetch(filePathOrUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      // Extract filename
      const urlPath = new URL(filePathOrUrl).pathname;
      fileName = path.basename(urlPath) || 'image.png';

      const contentType = response.headers.get('content-type') || '';

      // Convert WebP to JPEG
      if (contentType.includes('webp') || fileName.endsWith('.webp')) {
        fileBuffer = await sharp(fileBuffer).jpeg().toBuffer();
        fileName = fileName.replace(/\.webp$/, '') + '.jpg';
        mimeType = 'image/jpeg';
      } else if (contentType.includes('jpeg')) {
        mimeType = 'image/jpeg';
      } else if (contentType.includes('png')) {
        mimeType = 'image/png';
      } else if (contentType.includes('gif')) {
        mimeType = 'image/gif';
      }
    } else {
      // Local file
      fileBuffer = fs.readFileSync(filePathOrUrl);
      fileName = path.basename(filePathOrUrl);
      if (fileName.endsWith('.webp')) {
        fileBuffer = await sharp(fileBuffer).jpeg().toBuffer();
        fileName = fileName.replace(/\.webp$/, '') + '.jpg';
        mimeType = 'image/jpeg';
      }
    }

    // Create file object
    const file = new File([fileBuffer], fileName, {
      type: mimeType
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


async function getNextPendingNFT() {
  const { data, error } = await supabase
    .from('story_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();
    
  const { data: last_data, error: last_error } = await supabase
    .from('story_queue')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  console.log(data, last_data);
  if (error || last_error) {
    if (error.code === 'PGRST116' || last_error.code === 'PGRST116') {
      // No rows returned
      console.log('📭 No pending NFTs in queue', error, last_error);
      return null;
    }
    throw error;
  }

  // if (error ) {
  //   if (error.code === 'PGRST116') {
  //     // No rows returned
  //     console.log('📭 No pending NFTs in queue', error);
  //     return null;
  //   }
  //   throw error;
  // }

  const nft_url = await generateImage(data.prompt, `https://gateway.pinata.cloud/ipfs/${last_data.nft_ipfshash}`);
  const ipfs = await uploadImageToIPFS(nft_url);
  data.nft_ipfshash = ipfs

  return data;
}

async function updateNFTStatus(id: number, status: string, updates: any = {}) {
  console.log(`🔄 Updating NFT status for ID ${id} to "${status}"`);
  console.log('Updates:', updates);

  try {
    const updateData = {
      id,
      status,
      ...updates
    };

    // FIXED: Use update instead of upsert, and add proper error handling
    const { data, error } = await supabase
      .from('story_queue')
      .update(updateData)
      .eq('id', id)
      .select(); // Add select to get the updated row back

    if (error) {
      console.error('❌ Database update error:', error);
      throw error;
    }

    console.log('✅ Database updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ updateNFTStatus failed:', error);
    throw error;
  }
}


async function deployNFT(nftData: any) {
  const ipfsHash = nftData.nft_ipfshash;
  
  // Create metadata object with the IPFS hash
  const metadata = {
    name: nftData.title,
    description: nftData.prompt,
    image: `ipfs://${ipfsHash}`,
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
    name: nftData.title,
    symbol: 'BRKLYN',
    uri: `ipfs://${metadataCid}`, // Use proper IPFS URI format
    payoutRecipient: walletClient.account.address as Address,
    chainId: baseSepolia.id,
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
}

async function main() {
  try {
    // Get the next pending NFT from database
    const nftData = await getNextPendingNFT();
    id = nftData?.id || uuidv4();
    name = nftData?.title || null;
    
    if (!nftData) {
      console.log('No pending NFTs to process');
      return;
    }

    console.log(`Processing: ${nftData.title}`);
    console.log(JSON.stringify(nftData, null, 2));
    
    // Mark as processing
    await updateNFTStatus(nftData.id, 'processing', {
      nft_ipfshash: nftData.nft_ipfshash
    });

    let result;
    let lastError;
    const maxRetries = 3;
    
    // Retry deployment up to 3 times
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Deployment attempt ${attempt}/${maxRetries}`);
        result = await deployNFT(nftData);
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s delay between retries
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If all retries failed, throw the last error
    if (!result) {
      throw lastError;
    }

    // Mark as completed and save transaction details
    await updateNFTStatus(nftData.id, 'completed', {
      tx: result.hash,
      coin: result.address,
      posted_at: new Date().toISOString(),
      nft_ipfshash: nftData.nft_ipfshash // Ensure this is included
    });

    // Post to Farcaster
    let farcasterResult = null;
    try {
      console.log('📱 Attempting to post to Farcaster...');
      farcasterResult = await postToFarcaster(nftData, result);
      if (farcasterResult) {
        console.log('✅ Farcaster post successful and database updated');
      }
    } catch (farcasterError) {
      console.error('❌ Farcaster posting failed:', farcasterError);
    }

    // Send success notification to Discord
    const successMessage = `**${nftData.title}** deployed successfully!\n\n` +
      `🔗 **View On ZORA:** [${result.address}](https://testnet.zora.co/coin/bsep:${result.address})\n` +
      `🔗 **Transaction:** [${result.hash}](https://sepolia.basescan.org/tx/${result.hash})\n` +
      `🪙 **Coin Address:** \`${result.address}\`\n` +
      `📝 **Description:** ${nftData.prompt}\n` +
      `🖼️ **Image:** [View on IPFS](https://gateway.pinata.cloud/ipfs/${nftData.nft_ipfshash})` +
      (farcasterResult ? `\n📱 **Farcaster:** [View Cast](${farcasterResult.url})` : '');
    
    await sendDiscordNotification(successMessage, false);

    return result;
  } catch (error) {
    console.error("❌ Error:", error);
    
    try {
      if (id) {
        await updateNFTStatus(id, 'failed', {
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
    }
    
    // Send error notification to Discord
    const errorMessage = `**${name}** deployment failed after 3 attempts!\n\n` +
      `❌ **Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n` +
      `⏰ **Time:** ${new Date().toLocaleString()}`;
    
    await sendDiscordNotification(errorMessage, true);
    
    throw error;
  }
}

// Run the main function
main();