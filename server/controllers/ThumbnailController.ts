import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import path from "node:path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";

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

export const generateThumbnail = async (req: Request, res: Response) => {
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

    const thumbnail = await Thumbnail.create({
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

    // Build the prompt
    let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;
    if (color_scheme) {
      prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
    }
    if (user_prompt) {
      prompt += ` Additional details: ${user_prompt}`;
    }
    prompt += ` Ensure the thumbnail is visually stunning, and designed to maximize click-through rates. Make it bold, professional, and impossible to ignore`;

    // Generate image using Pollinations.ai (FREE - no API key needed!)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    // Download the image
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const finalBuffer = Buffer.from(response.data, "binary");

    const filename = `final-output-${Date.now()}.png`;
    const filepath = path.join("images", filename);

    // Create the images directory if it doesn't exist
    fs.mkdirSync("images", { recursive: true });

    // Write the final image to the file
    fs.writeFileSync(filepath, finalBuffer);

    // Upload to Cloudinary
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

    // Remove the local file after upload
    fs.unlinkSync(filepath);
  } catch (error: any) {
    console.error("Error generating thumbnail:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate thumbnail" });
  }
};

// Controller to delete a thumbnail
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
