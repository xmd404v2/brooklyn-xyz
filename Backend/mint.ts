import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['REPLICATE_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

interface ReplicateResponse {
  id: string;
  status: string;
  output?: string[];
}

export default async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-1.1-pro', // Replace with exact version ID if needed
        input: { prompt: `A vibrant, detailed scene: ${prompt}` }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ReplicateResponse = await response.json();

    // Poll for completion
    const predictionId = data.id;
    console.log("PRdedd ID", predictionId);
    let imageUrl: string | undefined;

    for (let i = 0; i < 30; i++) { // Max 30s
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: { Authorization: `Token ${process.env.REPLICATE_API_KEY}` }
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`HTTP error! status: ${statusResponse.status}`);
      }

      const status: ReplicateResponse = await statusResponse.json();
      console.log(status);

      if (status.status === 'succeeded') {
        imageUrl = status.output;
        break;
      } else if (status.status === 'failed') {
        throw new Error('Image generation failed');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!imageUrl) throw new Error('Image generation timed out');
    return imageUrl;
  } catch (error) {
    throw error;
  }
}