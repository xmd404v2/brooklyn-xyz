const dotenv = require('dotenv');
dotenv.config();

const requiredEnvVars = ['REPLICATE_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

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
    return imageUrl;
  } catch (error) {
    throw error;
  }
}