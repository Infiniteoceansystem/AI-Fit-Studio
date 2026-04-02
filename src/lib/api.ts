import { GoogleGenAI } from "@google/genai";
import { UploadedImage, Resolution } from '../types';

export const generateTryOn = async (
  modelImg: UploadedImage,
  topGarmentImg: UploadedImage,
  bottomGarmentImg?: UploadedImage | null,
  bgImg?: UploadedImage | null,
  resolution: Resolution = '1K',
  poseInstruction?: string,
  cameraAngleInstruction?: string,
  variationIndex?: number
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const parts: any[] = [
    { inlineData: { data: modelImg.base64, mimeType: modelImg.mimeType } },
    { inlineData: { data: topGarmentImg.base64, mimeType: topGarmentImg.mimeType } }
  ];

  let prompt = "A photorealistic, high-quality image of the person in the first reference image wearing the top/main clothing shown in the second reference image.";

  let bgIndex = "third";

  if (bottomGarmentImg) {
    parts.push({ inlineData: { data: bottomGarmentImg.base64, mimeType: bottomGarmentImg.mimeType } });
    prompt += " They should also be wearing the bottom garment (pants/skirt) shown in the third reference image.";
    bgIndex = "fourth";
  }

  prompt += " The clothing should fit naturally, respecting the body shape of the person. Maintain the person's original identity and face.";

  if (cameraAngleInstruction) {
    prompt += ` Camera angle and framing: ${cameraAngleInstruction}.`;
  }

  if (poseInstruction) {
    prompt += ` For the pose and action: ${poseInstruction}. CRITICAL: The pose instruction MUST ONLY affect the person's body and face. It MUST NOT alter, replace, or hallucinate the background environment.`;
    if (variationIndex) {
       prompt += ` This is variation ${variationIndex}. Please ensure the pose is uniquely interpreted to add variety.`;
    }
  } else if (variationIndex) {
    prompt += ` This is variation ${variationIndex}. Generate a completely unique, natural pose and action for the person. Do NOT use the original pose.`;
  } else {
    prompt += " Maintain the person's original pose.";
  }

  if (bgImg) {
    parts.push({ inlineData: { data: bgImg.base64, mimeType: bgImg.mimeType } });
    prompt += ` Use the ${bgIndex} reference image to define the environment, lighting, and vibe. Place the person naturally in this exact same space/location. `;
    if (variationIndex) {
       prompt += `CRITICAL: This is variation ${variationIndex}. Do NOT just rigidly paste the person onto the exact background image. Instead, render a dynamic background that belongs to this same space. Allow for slight variations in the background's camera angle, framing, or showing slightly different parts of the same room/environment. It should feel like a dynamic photoshoot moving around within the same location. `;
    } else {
       prompt += `The lighting, shadows, and perspective should match this environment perfectly. `;
    }
  } else {
    prompt += " Keep the original background from the first image.";
  }

  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: resolution
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("未能生成图片，请重试。");
};

export const editImage = async (
  sourceImageUrl: string,
  prompt: string,
  resolution: Resolution = '1K'
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Extract base64 and mimeType from data URL
  const [prefix, base64] = sourceImageUrl.split(',');
  const mimeType = prefix.split(':')[1].split(';')[0];

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: `根据以下口语化指令修改图片，请保持人物核心特征、背景风格以及照片级真实感：${prompt}` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: resolution
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("未能生成修改后的图片，请重试。");
};
