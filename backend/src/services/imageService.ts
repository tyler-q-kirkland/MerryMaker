import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

export async function processAndSaveImage(
  file: Express.Multer.File,
  userId: number
): Promise<string> {
  const uploadsDir = path.join(__dirname, '../../uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = `user-${userId}-${Date.now()}.jpg`;
  const filepath = path.join(uploadsDir, filename);

  // Resize and optimize the image
  await sharp(file.buffer)
    .resize(500, 500, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 85 })
    .toFile(filepath);

  return `/uploads/${filename}`;
}

export async function composeFestiveImage(
  ceoImagePath: string,
  recipientImagePath: string,
  aiGeneratedImagePath: string
): Promise<string> {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // If we have an AI-generated image path from Stability AI, just return it
    // Stability AI already saved the integrated image, no need to composite further
    if (aiGeneratedImagePath) {
      console.log('Using Stability AI generated image:', aiGeneratedImagePath);
      return aiGeneratedImagePath;
    }
    
    // Legacy code for downloading from URL (if needed for DALL-E)
    if (aiGeneratedImagePath && aiGeneratedImagePath.startsWith('http')) {
      try {
        const outputFilename = `ornament-card-${Date.now()}.jpg`;
        const outputPath = path.join(uploadsDir, outputFilename);
        
        console.log('Downloading AI-generated image from URL...');
        const response = await axios.get(aiGeneratedImagePath, {
          responseType: 'arraybuffer',
        });
        
        const backgroundImage = Buffer.from(response.data);
        
        // Load and prepare user photos as circular images
        const ceoFullPath = path.join(__dirname, '../..', ceoImagePath);
        const recipientFullPath = path.join(__dirname, '../..', recipientImagePath);
        
        // Create circular CEO photo (200x200)
        const ceoCircle = await sharp(ceoFullPath)
          .resize(200, 200, { fit: 'cover', position: 'center' })
          .composite([{
            input: Buffer.from(`<svg width="200" height="200">
              <circle cx="100" cy="100" r="100" fill="white"/>
            </svg>`),
            blend: 'dest-in'
          }])
          .toBuffer();
        
        // Create circular recipient photo (200x200)
        const recipientCircle = await sharp(recipientFullPath)
          .resize(200, 200, { fit: 'cover', position: 'center' })
          .composite([{
            input: Buffer.from(`<svg width="200" height="200">
              <circle cx="100" cy="100" r="100" fill="white"/>
            </svg>`),
            blend: 'dest-in'
          }])
          .toBuffer();
        
        // Composite the circular photos onto the ornament scene
        // Positioning: assuming ornaments are roughly centered
        // Left ornament around x=300, Right ornament around x=700, both at y=400
        await sharp(backgroundImage)
          .composite([
            {
              input: ceoCircle,
              left: 212,  // Center of left ornament (312 - 100)
              top: 312,   // Center position (412 - 100)
            },
            {
              input: recipientCircle,
              left: 612,  // Center of right ornament (712 - 100)
              top: 312,   // Center position (412 - 100)
            },
          ])
          .jpeg({ quality: 95 })
          .toFile(outputPath);
        
        console.log('User photos composited onto ornament scene successfully!');
        return `/uploads/${outputFilename}`;
      } catch (aiError) {
        console.error('Error compositing photos onto ornaments, falling back:', aiError);
        // Fall through to simple composite version below
      }
    }
    
    // Fallback: Create composite with actual user photos
    const outputFilename = `festive-${Date.now()}.jpg`;
    const outputPath = path.join(uploadsDir, outputFilename);

    const ceoFullPath = path.join(__dirname, '../..', ceoImagePath);
    const recipientFullPath = path.join(__dirname, '../..', recipientImagePath);

    // Resize both images to circular format (300x300)
    const ceoImage = await sharp(ceoFullPath)
      .resize(300, 300, { fit: 'cover', position: 'center' })
      .toBuffer();
    
    const recipientImage = await sharp(recipientFullPath)
      .resize(300, 300, { fit: 'cover', position: 'center' })
      .toBuffer();

    // Create a festive Christmas-themed background
    // Using a gradient from dark green to red
    const width = 1000;
    const height = 600;
    
    // Create SVG for festive decorations
    const decorativeSVG = `
      <svg width="${width}" height="${height}">
        <!-- Festive gradient background -->
        <defs>
          <linearGradient id="festiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f5132;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#146b3a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#c41e3a;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#festiveGrad)"/>
        
        <!-- Snowflakes -->
        <circle cx="100" cy="80" r="8" fill="white" opacity="0.7"/>
        <circle cx="200" cy="120" r="6" fill="white" opacity="0.6"/>
        <circle cx="850" cy="100" r="7" fill="white" opacity="0.8"/>
        <circle cx="750" cy="150" r="5" fill="white" opacity="0.7"/>
        <circle cx="900" cy="200" r="6" fill="white" opacity="0.6"/>
        <circle cx="150" cy="500" r="7" fill="white" opacity="0.7"/>
        <circle cx="800" cy="480" r="8" fill="white" opacity="0.8"/>
        <circle cx="500" cy="50" r="6" fill="white" opacity="0.6"/>
        
        <!-- Stars -->
        <text x="120" y="200" font-size="40" fill="gold" opacity="0.8">✨</text>
        <text x="820" y="350" font-size="35" fill="gold" opacity="0.7">✨</text>
        <text x="450" y="550" font-size="30" fill="gold" opacity="0.8">⭐</text>
        
        <!-- Christmas trees -->
        <text x="50" y="550" font-size="60" fill="#2d5016">🎄</text>
        <text x="880" y="560" font-size="60" fill="#2d5016">🎄</text>
        
        <!-- Title banner -->
        <rect x="200" y="30" width="600" height="80" rx="15" fill="#c41e3a" opacity="0.9"/>
        <text x="500" y="85" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
              fill="white" text-anchor="middle">Merry Christmas!</text>
      </svg>
    `;

    // Create the composite image
    await sharp(Buffer.from(decorativeSVG))
      .composite([
        // CEO image on the left with white border
        { 
          input: await sharp(ceoImage)
            .resize(280, 280)
            .composite([{
              input: Buffer.from(`<svg width="280" height="280">
                <circle cx="140" cy="140" r="138" fill="white"/>
              </svg>`),
              blend: 'dest-over'
            }])
            .toBuffer(),
          left: 150, 
          top: 200 
        },
        // Recipient image on the right with white border
        { 
          input: await sharp(recipientImage)
            .resize(280, 280)
            .composite([{
              input: Buffer.from(`<svg width="280" height="280">
                <circle cx="140" cy="140" r="138" fill="white"/>
              </svg>`),
              blend: 'dest-over'
            }])
            .toBuffer(),
          left: 570, 
          top: 200 
        },
      ])
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    return `/uploads/${outputFilename}`;
  } catch (error) {
    console.error('Error composing festive image:', error);
    // Fallback: create simple composite if decorative version fails
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      const outputFilename = `festive-simple-${Date.now()}.jpg`;
      const outputPath = path.join(uploadsDir, outputFilename);
      
      const ceoFullPath = path.join(__dirname, '../..', ceoImagePath);
      const recipientFullPath = path.join(__dirname, '../..', recipientImagePath);
      
      const ceoImage = await sharp(ceoFullPath).resize(300, 300).toBuffer();
      const recipientImage = await sharp(recipientFullPath).resize(300, 300).toBuffer();
      
      await sharp({
        create: {
          width: 800,
          height: 400,
          channels: 4,
          background: { r: 196, g: 30, b: 58, alpha: 1 },
        },
      })
        .composite([
          { input: ceoImage, left: 50, top: 50 },
          { input: recipientImage, left: 450, top: 50 },
        ])
        .jpeg({ quality: 90 })
        .toFile(outputPath);
      
      return `/uploads/${outputFilename}`;
    } catch (fallbackError) {
      console.error('Fallback image creation also failed:', fallbackError);
      return '';
    }
  }
}
