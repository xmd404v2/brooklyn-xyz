import dotenv from 'dotenv';
import { fal } from '@fal-ai/client';

dotenv.config();

const requiredEnvVars = ['FAL_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Configure fal.ai client with API key
fal.config({
  credentials: process.env.FAL_API_KEY,
});

interface FalResponse {
  images?: { url: string; content_type: string }[];
  error?: { message: string };
}

async function generateImage(prompt: string): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Image generation attempt ${attempt}/${maxRetries}`);
      const result = await fal.queue.submit('fal-ai/flux.1-dev', {
        input: {
          prompt: `A vibrant, detailed scene: ${prompt}`,
          image_size: 'square_hd',
          num_inference_steps: 28,
          enable_safety_checker: true,
          output_format: 'jpeg',
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log('Progress:', update.logs?.map((log) => log.message));
          }
        },
      });

      const data: FalResponse = result as FalResponse;
      console.log('fal.ai Request ID:', result.requestId);

      if (data.images && data.images.length > 0) {
        const imageUrl = data.images[0].url;
        console.log('Image URL:', imageUrl);
        return imageUrl;
      }

      throw new Error('No images returned');
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        const delay = attempt * 2000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Image generation failed after retries');
}

export default generateImage;