import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import type { IThumbnail } from "../models/Thumbnail.js";
import type { HydratedDocument } from "mongoose";
import fs from "fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",
  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",
  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};

const aspectRatioDimensions = {
  "16:9": { width: 1280, height: 720 },
  "1:1": { width: 1024, height: 1024 },
  "9:16": { width: 720, height: 1280 },
} as const;

const buildPrompt = ({
  title,
  style,
  aspectRatio,
  colorScheme,
  userPrompt,
  textOverlay,
}: {
  title: string;
  style: string;
  aspectRatio: keyof typeof aspectRatioDimensions;
  colorScheme?: string;
  userPrompt?: string;
  textOverlay?: boolean;
}) => {
  let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} thumbnail for: "${title}".`;

  if (colorScheme) {
    prompt += ` Use a ${
      colorSchemeDescriptions[colorScheme as keyof typeof colorSchemeDescriptions]
    } color scheme.`;
  }

  if (userPrompt) {
    prompt += ` Additional details: ${userPrompt}.`;
  }

  prompt += ` The thumbnail must match a ${aspectRatio} layout, feel premium, bold, high-contrast, and optimized for click-through rate.`;

  if (textOverlay) {
    prompt +=
      " Include large, clean headline-style text placement that feels readable and YouTube-ready.";
  }

  prompt +=
    " Avoid watermarks, extra fingers, distorted faces, blurry details, low contrast, and illegible text.";

  return prompt;
};

const sanitizePrompt = (prompt: string) =>
  prompt
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 900);

const getPollinationsApiKey = () => process.env.POLLINATIONS_API_KEY?.trim();

const createPollinationsUrl = ({
  prompt,
  width,
  height,
  seed,
  model,
  enhance,
  nologo,
}: {
  prompt: string;
  width: number;
  height: number;
  seed: number;
  model?: string;
  enhance?: boolean;
  nologo?: boolean;
}) => {
  const url = new URL(
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`,
  );

  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  url.searchParams.set("seed", String(seed));

  if (model) {
    url.searchParams.set("model", model);
  }

  if (enhance) {
    url.searchParams.set("enhance", "true");
  }

  if (nologo) {
    url.searchParams.set("nologo", "true");
  }

  const apiKey = getPollinationsApiKey();

  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  return url.toString();
};

const fetchPollinationsImage = async (imageUrl: string) => {
  const apiKey = getPollinationsApiKey();
  const response = await fetch(imageUrl, {
    headers: {
      Accept: "image/*",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = (await response.text()).slice(0, 300);
    throw new Error(
      `Free image provider failed with status ${response.status}${
        errorText ? `: ${errorText}` : ""
      }`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const createPollinationsSeed = () =>
  Math.floor(Math.random() * 2_147_483_647);

const generateWithPollinations = async ({
  prompt,
  aspectRatio,
}: {
  prompt: string;
  aspectRatio: keyof typeof aspectRatioDimensions;
}) => {
  if (!getPollinationsApiKey()) {
    throw new Error(
      "Pollinations API key is missing. Set POLLINATIONS_API_KEY in server/.env.",
    );
  }

  const { width, height } = aspectRatioDimensions[aspectRatio];
  const seed = createPollinationsSeed();
  const sanitizedPrompt = sanitizePrompt(prompt);
  const requestUrls = [
    createPollinationsUrl({
      prompt: sanitizedPrompt,
      width,
      height,
      seed,
    }),
    createPollinationsUrl({
      prompt: sanitizedPrompt,
      width,
      height,
      seed,
      model: "flux",
    }),
    createPollinationsUrl({
      prompt: sanitizedPrompt,
      width,
      height,
      seed,
      model: "flux",
      enhance: true,
    }),
  ];

  let lastError: Error | null = null;

  for (const imageUrl of requestUrls) {
    try {
      return await fetchPollinationsImage(imageUrl);
    } catch (error) {
      lastError = error as Error;
      console.warn("Pollinations request failed:", imageUrl, lastError.message);
    }
  }

  throw (
    lastError ??
    new Error("Free image provider failed before returning an image")
  );
};

export const generateThumbnail = async (req: Request, res: Response) => {
  let thumbnail: HydratedDocument<IThumbnail> | null = null;
  let filepath: string | null = null;

  try {
    const { userId } = req.session;
    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    const safeAspectRatio =
      aspect_ratio && aspect_ratio in aspectRatioDimensions
        ? (aspect_ratio as keyof typeof aspectRatioDimensions)
        : "16:9";

    const prompt = buildPrompt({
      title,
      style,
      aspectRatio: safeAspectRatio,
      colorScheme: color_scheme,
      userPrompt: user_prompt,
      textOverlay: text_overlay,
    });

    const finalBuffer = await generateWithPollinations({
      prompt,
      aspectRatio: safeAspectRatio,
    });

    const filename = `final-output-${Date.now()}.png`;
    filepath = path.join("images", filename);

    fs.mkdirSync("images", { recursive: true });
    fs.writeFileSync(filepath, finalBuffer);

    const uploadResult = await cloudinary.uploader.upload(filepath, {
      resource_type: "image",
    });

    thumbnail.image_url = uploadResult.url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    res.json({
      success: true,
      message: "Thumbnail generated successfully",
      thumbnail,
    });
  } catch (error: any) {
    console.error("Error generating thumbnail:", error);

    if (thumbnail) {
      try {
        thumbnail.isGenerating = false;
        await thumbnail.save();
      } catch (saveError) {
        console.error("Error updating failed thumbnail status:", saveError);
      }
    }

    const message =
      error instanceof Error ? error.message : "Failed to generate thumbnail";

    res.status(500).json({ success: false, error: message });
  } finally {
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
};

//Controller to delete a thumbnail
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

   await Thumbnail.findOneAndDelete({
      _id: id,
      userId,
    });

    res.json({ success: true, message: "Thumbnail deleted successfully" });

  } catch (error: any) {
    console.error("Error deleting thumbnail:", error);
    res.status(500).json({ success: false, error: "Failed to delete thumbnail" });
  }
};
