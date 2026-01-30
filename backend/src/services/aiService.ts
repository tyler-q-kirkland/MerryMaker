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
    console.log('Generating festive image using Replicate reve/remix model...');
    
    // Convert both images to base64 data URLs for reference_images
    const ceoBase64 = await imageToBase64(ceoImagePath);
    const recipientBase64 = await imageToBase64(recipientImagePath);
    
    console.log('CEO image size:', ceoBase64.length, 'bytes');
    console.log('Recipient image size:', recipientBase64.length, 'bytes');
    
    const ceoMimeType = ceoImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const recipientMimeType = recipientImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    const ceoDataUrl = `data:${ceoMimeType};base64,${ceoBase64}`;
    const recipientDataUrl = `data:${recipientMimeType};base64,${recipientBase64}`;
    
    // Create prediction using Replicate's reve/remix model
    // This model uses reference_images array and blends them together
    const requestBody = {
      input: {
        prompt: 'Take these two people and put them into a Christmas scene. The Christmas scenes can be one of the following numbered options: 1. Snowball fight 2. Sleighriding 3. Walking down a christmas village road 4. Building a snowman 5. Putting up christmas lights 6. Building a gingerbread house 7. Ice skating 8. Decorating a christmas tree 9. One person holding the ladder the other hanging lights 10. Sledding down a hill 11. Sitting by a fireplace in sweaters 12. Drinking hot chocolate or mulled cider 13. Carrying a small tree together. The style should be cartoonish in nature, like the classic television show Peanuts. Remember that this will be between a CEO and an employee and should not be too personal- but ensure it is still warm.',
        version: 'latest',
        aspect_ratio: '3:2',
        reference_images: [ceoDataUrl, recipientDataUrl],
      },
    };
    
    console.log('Sending request to Replicate reve/remix with:');
    console.log('- Prompt length:', requestBody.input.prompt.length);
    console.log('- Reference images count:', requestBody.input.reference_images.length);
    console.log('- Image 1 length:', requestBody.input.reference_images[0].length);
    console.log('- Image 2 length:', requestBody.input.reference_images[1].length);
    
    const createResponse = await axios.post(
      'https://api.replicate.com/v1/models/reve/remix/predictions',
      requestBody,
      {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('Replicate prediction created:', createResponse.data.id);
    console.log('Full response:', JSON.stringify(createResponse.data, null, 2));
    
    if (createResponse.data.error) {
      console.error('Replicate error:', createResponse.data.error);
    }
    
    // Poll for the result
    let prediction = createResponse.data;
    const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max
    let attempts = 0;
    
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
          },
        }
      );
      
      prediction = statusResponse.data;
      attempts++;
      console.log(`Prediction status: ${prediction.status} (attempt ${attempts}/${maxAttempts})`);
      
      if (prediction.error) {
        console.error('Prediction error:', prediction.error);
      }
    }
    
    if (prediction.status === 'succeeded' && prediction.output) {
      // The output should be a file object with a url() method or just a URL string
      const imageUrl = typeof prediction.output === 'string' 
        ? prediction.output 
        : prediction.output.url || prediction.output[0];
      
      console.log('Image generated successfully, downloading from:', imageUrl);
      
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      
      const uploadsDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filename = `replicate-remix-${Date.now()}.jpg`;
      const filepath = path.join(uploadsDir, filename);
      
      await fs.writeFile(filepath, Buffer.from(imageResponse.data));
      console.log('Replicate remix image saved successfully!');
      
      return { imagePath: `/uploads/${filename}`, usedFallback: false };
    }
    
    throw new Error(`Prediction failed or timed out. Status: ${prediction.status}, Error: ${prediction.error || 'none'}`);
  } catch (error) {
    console.error('Error generating festive image with Replicate:', error);
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
