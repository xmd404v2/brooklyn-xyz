const result = await fal.queue.submit('fal-ai/fast-sdxl', {
  input: {
    prompt: 'A vibrant cyberpunk cityscape at night',
    image_size: 'square',
    num_inference_steps: 28,
    guidance_scale: 7.5,
    enable_safety_checker: true,
    output_format: 'jpeg',
  },
  logs: true,
});