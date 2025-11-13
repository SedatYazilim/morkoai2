/**
 * Pollinations AI Integration
 * Free AI image generation service
 */

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  seed?: number;
}

export interface GenerateImageResult {
  imageUrl: string;
  prompt: string;
  model: string;
  width: number;
  height: number;
  seed: number;
}

/**
 * Generate an image using Pollinations AI
 * Free service, no API key required
 */
export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const {
    prompt,
    model = "flux",
    width = 1024,
    height = 1024,
    seed = Math.floor(Math.random() * 1000000),
  } = options;

  // Pollinations AI URL format
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=${width}&height=${height}&seed=${seed}&nologo=true`;

  return {
    imageUrl,
    prompt,
    model,
    width,
    height,
    seed,
  };
}

/**
 * Get available models from Pollinations
 */
export async function getAvailableModels() {
  return [
    { id: "flux", name: "Flux (Default)", description: "High quality, fast generation" },
    { id: "flux-realism", name: "Flux Realism", description: "Photorealistic images" },
    { id: "flux-anime", name: "Flux Anime", description: "Anime style images" },
    { id: "flux-3d", name: "Flux 3D", description: "3D rendered style" },
  ];
}
