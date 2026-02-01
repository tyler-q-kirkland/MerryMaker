import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

// Configure OpenAI SDK to use OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
    'X-Title': 'MerryMaker Christmas Cards',
  },
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
      model: 'openai/gpt-4o',  // Using OpenRouter's model naming
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
  recipientWord: string,
  ceoName: string,
  recipientName: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4',  // Using OpenRouter's model naming
      messages: [
        {
          role: 'system',
          content:
            'You are a warm and festive Christmas card message writer. Create positive, heartfelt messages that combine the CEO\'s personal message with the recipient\'s special word. IMPORTANT: Use the actual names provided - never use placeholders like [CEO\'s name], [Your Name], or [Recipient\'s name]. Always use the real names given to you. DO NOT include greetings like "Dear" or closings like "From" or "Sincerely" - just write the message body.',
        },
        {
          role: 'user',
          content: `Create a warm Christmas card message that incorporates the following:
- CEO's name: ${ceoName}
- CEO's personal message: "${ceoMessage}"
- Recipient's name: ${recipientName}
- Recipient's special word: "${recipientWord}"

CRITICAL RULES:
1. Use the actual names "${ceoName}" and "${recipientName}" in the message. Do NOT use placeholders like [CEO's name], [Your Name], or [Recipient's name].
2. DO NOT start with "Dear ${recipientName}" or any greeting - the card already has that.
3. DO NOT end with "From ${ceoName}" or "Sincerely" or any closing - the card already has a signature.
4. Just write the message body content - 2-3 sentences that are festive, positive, and heartfelt.

The message should feel personal and warm, coming from ${ceoName} to ${recipientName}, incorporating the word "${recipientWord}".`,
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
): Promise<{ imagePath: string; usedFallback: boolean }> {
  try {
    console.log('Generating festive image using Gemini 3 Pro Image via OpenRouter...');
    
    // Convert both images to base64 data URLs
    const ceoBase64 = await imageToBase64(ceoImagePath);
    const recipientBase64 = await imageToBase64(recipientImagePath);
    
    console.log('CEO image size:', ceoBase64.length, 'bytes');
    console.log('Recipient image size:', recipientBase64.length, 'bytes');
    
    const ceoMimeType = ceoImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const recipientMimeType = recipientImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    const ceoDataUrl = `data:${ceoMimeType};base64,${ceoBase64}`;
    const recipientDataUrl = `data:${recipientMimeType};base64,${recipientBase64}`;
    
    // Use Gemini 3 Pro Image through OpenRouter for image generation
    // Include aspect ratio instruction directly in the prompt since OpenRouter may not support parameter passing
    const prompt = `Generate an image in 3:2 aspect ratio (landscape orientation, wider than tall).

Take these two people and create a festive Christmas scene with them. Choose one of these scenarios: snowball fight, sleigh riding, walking down a Christmas village road, building a snowman, putting up Christmas lights, building a gingerbread house, ice skating, decorating a Christmas tree, one person holding a ladder while the other hangs lights, sledding down a hill, sitting by a fireplace in sweaters, drinking hot chocolate or mulled cider, or carrying a small tree together. 

Peanuts style.

IMPORTANT: 
- The image MUST be in 3:2 aspect ratio (landscape/horizontal format)
- Both people from the reference images must be clearly visible and recognizable in the final scene
- Maintain their facial features, skin tones, and distinctive characteristics accurately but in the Peanuts style
- Don't add any other Peanuts characters`;

    console.log('Sending request to Gemini 3 Pro Image via OpenRouter...');
    
    const response = await openai.chat.completions.create({
      model: 'google/gemini-3-pro-image-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: ceoDataUrl,
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: recipientDataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    } as any);

    console.log('Gemini 3 Pro Image response received');
    
    // Gemini returns base64 image data in various possible formats
    const message = response.choices[0]?.message;
    console.log('Message content type:', typeof message?.content);
    console.log('Message content is array?', Array.isArray(message?.content));
    console.log('Message has images?', !!(message as any)?.images);
    
    if (!message) {
      throw new Error('No message in response from Gemini 3 Pro Image');
    }

    let base64Data: string;
    
    // Check for images array first (Gemini 3 Pro Image format)
    if ((message as any).images && Array.isArray((message as any).images) && (message as any).images.length > 0) {
      console.log('Found images array with', (message as any).images.length, 'images');
      const firstImage = (message as any).images[0];
      
      if (firstImage.type === 'image_url' && firstImage.image_url?.url) {
        console.log('Extracting base64 from image_url format');
        const imageUrl = firstImage.image_url.url;
        base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      } else {
        throw new Error('Unexpected image format in images array');
      }
    }
    // Handle array content format
    else if (Array.isArray(message.content)) {
      console.log('Content is array format');
      const imageContent = message.content.find((item: any) => item.type === 'image');
      
      if (!imageContent || !imageContent.image) {
        console.log('No image data found in array. Content:', JSON.stringify(message.content, null, 2));
        throw new Error('No image data found in Gemini 3 Pro Image response');
      }
      
      base64Data = imageContent.image.replace(/^data:image\/\w+;base64,/, '');
    }
    // Handle string content format
    else if (typeof message.content === 'string') {
      console.log('Content is string format, checking for base64...');
      // Content might be a direct base64 string or data URL
      if (message.content.startsWith('data:image')) {
        base64Data = message.content.replace(/^data:image\/\w+;base64,/, '');
      } else {
        // Assume it's already base64
        base64Data = message.content;
      }
    } else {
      throw new Error('Unexpected content format from Gemini 3 Pro Image - no images array, content array, or string content found');
    }

    console.log('Found base64 image data, length:', base64Data.length);
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const uploadsDir = path.join(__dirname, '../../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filename = `gemini-generated-${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);
    
    await fs.writeFile(filepath, imageBuffer);
    console.log('Gemini 3 Pro Image saved successfully!');
    
    return { imagePath: `/uploads/${filename}`, usedFallback: false };
  } catch (error) {
    console.error('Error generating festive image with Gemini 3 Pro Image:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    
    // Fallback to festive composite with decorative wreaths
    console.log('Falling back to festive composite service...');
    const { createFestiveComposite } = require('./festiveCompositeService');
    
    try {
      const imagePath = await createFestiveComposite(ceoImagePath, recipientImagePath);
      return { imagePath, usedFallback: true };
    } catch (fallbackError) {
      console.error('Error creating festive composite:', fallbackError);
      return { imagePath: '', usedFallback: true };
    }
  }
}
