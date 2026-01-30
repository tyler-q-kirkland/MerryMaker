import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// Helper function to convert image to base64
async function imageToBase64(imagePath: string): Promise<string> {
  const fullPath = path.join(__dirname, '../..', imagePath);
  const imageBuffer = await fs.readFile(fullPath);
  return imageBuffer.toString('base64');
}

// Analyze a photo and describe the person
async function describePhoto(imagePath: string, personRole: string): Promise<string> {
  try {
    const base64Image = await imageToBase64(imagePath);
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',  // Updated model name (gpt-4-vision-preview is deprecated)
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are analyzing a photo to create an accurate description for AI image generation. Describe this person's appearance with PRECISE details that will ensure the generated image looks like them:

CRITICAL - Include these specific details:
- Exact skin tone (very pale, fair, light, medium, tan, olive, brown, dark brown, etc.)
- Precise ethnicity/racial features if visible (Caucasian, Asian, African, Hispanic, etc.)
- Exact hair color (platinum blonde, golden blonde, light brown, dark brown, black, gray, white, red, auburn, etc.)
- Specific hair style and length (short cropped, shoulder-length wavy, long straight, curly, etc.)
- Facial features (round face, angular face, prominent cheekbones, etc.)
- Eye color if visible
- Approximate age range
- Any distinctive features (glasses, facial hair, etc.)
- Gender

Be VERY specific about ethnicity and skin tone to ensure accurate representation. This is the ${personRole}.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 250,
    });

    return response.choices[0]?.message?.content || `a person (${personRole})`;
  } catch (error) {
    console.error(`Error describing ${personRole} photo:`, error);
    return `a person (${personRole})`;
  }
}

export async function generateChristmasMessage(
  ceoMessage: string,
  recipientWord: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a warm and festive Christmas card message writer. Create positive, heartfelt messages that combine the CEO\'s personal message with the recipient\'s special word.',
        },
        {
          role: 'user',
          content: `Create a warm Christmas card message that incorporates the following:
- CEO's personal message: "${ceoMessage}"
- Recipient's special word: "${recipientWord}"

Make it festive, positive, and heartfelt. Keep it to 2-3 sentences.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || 'Merry Christmas and Happy Holidays!';
  } catch (error) {
    console.error('Error generating AI message:', error);
    return `${ceoMessage} Wishing you a wonderful holiday season filled with ${recipientWord}!`;
  }
}

export async function generateFestiveImage(
  ceoImagePath: string,
  recipientImagePath: string,
  ceoName: string,
  recipientName: string
): Promise<string> {
  // Use festive composite with decorative wreaths - simple, reliable, and professional
  const { createFestiveComposite } = require('./festiveCompositeService');
  
  try {
    console.log('Creating festive composite with decorative wreaths...');
    const imagePath = await createFestiveComposite(ceoImagePath, recipientImagePath);
    return imagePath;
  } catch (error) {
    console.error('Error creating festive composite:', error);
    return '';
  }
}
