import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['FAL_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

interface FalResponse {
  request_id: string;
  status: string;
  images?: { url: string }[];
  error?: { message: string };
}

async function generateImage(prompt: string): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Image generation attempt ${attempt}/${maxRetries}`);
      const response = await fetch('https://queue.fal.run/fal-ai/flux.1', {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.FAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `A vibrant, detailed scene: ${prompt}`,
          image_size: 'square_hd',
          num_inference_steps: 28,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FalResponse = await response.json();
      console.log('fal.ai Request ID:', data.request_id);

      // Check if images are available immediately
      if (data.status === 'completed' && data.images && data.images.length > 0) {
        const imageUrl = data.images[0].url;
        console.log('Image URL:', imageUrl);
        return imageUrl;
      }

      // Poll for completion
      const requestId = data.request_id;
      let imageUrl: string | undefined;

      for (let i = 0; i < 30; i++) {
        const statusResponse = await fetch(`https://queue.fal.run/requests/${requestId}`, {
          headers: { Authorization: `Key ${process.env.FAL_API_KEY}` },
        });

        if (!statusResponse.ok) {
          throw new Error(`HTTP error! status: ${statusResponse.status}`);
        }

        const status: FalResponse = await statusResponse.json();
        console.log('Status:', status);

        if (status.status === 'completed' && status.images && status.images.length > 0) {
          imageUrl = status.images[0].url;
          break;
        } else if (status.status === 'failed' || status.error) {
          throw new Error(status.error?.message || 'Image generation failed');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!imageUrl) {
        throw new Error('Image generation timed out');
      }

      console.log('Image URL:', imageUrl);
      return imageUrl;
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