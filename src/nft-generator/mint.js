const { ethers } = require('ethers');
const cron = require('node-cron');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises;
const dotenv = require('dotenv');
dotenv.config();

// Validate environment variables
const requiredEnvVars = ['PRIVATE_KEY', 'REPLICATE_API_KEY', 'PINATA_API_KEY', 'PINATA_SECRET_API_KEY', 'BACKEND_API_URL', 'ZORA_CONTRACT_ADDRESS'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Set up provider and wallet (Base Sepolia testnet)
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Zora contract (replace with actual ABI and address from your repo)
const zoraContractAddress = process.env.ZORA_CONTRACT_ADDRESS;
const zoraABI = [
  'function mint(address to, string memory tokenURI) external'
];
const zoraContract = new ethers.Contract(zoraContractAddress, zoraABI, wallet);

// Log to file
async function log(message) {
  const timestamp = new Date().toISOString();
  try {
    await fs.appendFile('logs/mint.log', `${timestamp}: ${message}\n`);
  } catch (error) {
    console.error(`Logging error: ${error.message}`);
  }
}

// Fetch top-voted prompt from backend
async function getTopSuggestion() {
  try {
    const response = await axios.get(`${process.env.BACKEND_API_URL}/top-suggestion`, { timeout: 5000 });
    const prompt = response.data.text || 'A futuristic space scene, part of an epic adventure';
    await log(`Fetched prompt: ${prompt}`);
    return prompt;
  } catch (error) {
    await log(`Error fetching prompt: ${error.message}`);
    return 'A futuristic space scene, part of an epic adventure';
  }
}

// Generate image using Replicate API
async function generateImage(prompt) {
  try {
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'black-forest-labs/flux-1.1-pro', // Replace with exact version ID if needed
        input: { prompt: `A vibrant, detailed scene: ${prompt}` }
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    // Poll for completion
    const predictionId = response.data.id;
    let imageUrl;
    for (let i = 0; i < 30; i++) { // Max 30s
      const status = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_KEY}` }
      });
      if (status.data.status === 'succeeded') {
        imageUrl = status.data.output[0];
        break;
      } else if (status.data.status === 'failed') {
        throw new Error('Image generation failed');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!imageUrl) throw new Error('Image generation timed out');
    await log('Image generated successfully');
    return imageUrl;
  } catch (error) {
    await log(`Image generation error: ${error.message}`);
    throw error;
  }
}

// Upload to IPFS using Pinata
async function uploadToIPFS(imageUrl) {
  try {
    // Download image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
    const imageBuffer = Buffer.from(imageResponse.data);

    // Create FormData for Pinata
    const form = new FormData();
    form.append('file', imageBuffer, {
      filename: `NFT-${Date.now()}.png`,
      contentType: 'image/png'
    });
    form.append('pinataMetadata', JSON.stringify({ name: `NFT-${Date.now()}` }));

    const pinataResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      form,
      {
        headers: {
          ...form.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
        },
        timeout: 10000
      }
    );
    const ipfsUri = `ipfs://${pinataResponse.data.IpfsHash}`;
    await log(`Uploaded to IPFS: ${ipfsUri}`);
    return ipfsUri;
  } catch (error) {
    await log(`IPFS upload error: ${error.message}`);
    throw error;
  }
}

// Mint NFT using Zora
async function mintNFT(ipfsUri) {
  try {
    const balance = await provider.getBalance(wallet.address);
    await log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
    if (balance === 0n) throw new Error('Insufficient ETH for gas');

    const tx = await zoraContract.mint(wallet.address, ipfsUri, {
      gasLimit: 300000
    });
    await tx.wait();
    await log(`NFT minted: ${ipfsUri}, Tx: ${tx.hash}`);
  } catch (error) {
    await log(`NFT minting error: ${error.message}`);
    throw error;
  }
}

// Main function
async function mintDailyNFT() {
  try {
    await log('Starting daily NFT mint...');
    const prompt = await getTopSuggestion();
    const imageUrl = await generateImage(prompt);
    const ipfsUri = await uploadToIPFS(imageUrl);
    await mintNFT(ipfsUri);
    await log('NFT minted successfully');
  } catch (error) {
    await log(`Daily NFT minting failed: ${error.message}`);
  }
}

// Schedule daily at 00:05 UTC
const job = cron.schedule('5 0 * * *', mintDailyNFT, { scheduled: true, timezone: 'Etc/UTC' });
console.log('NFT generator scheduled');
job.start();
mintDailyNFT();