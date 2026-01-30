import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

/**
 * Create a professional festive Christmas card with user photos in decorative wreaths
 */
export async function createFestiveComposite(
  ceoImagePath: string,
  recipientImagePath: string
): Promise<string> {
  try {
    console.log('Creating festive composite with decorative wreaths...');
    
    const uploadsDir = path.join(__dirname, '../../uploads');
    const ceoFullPath = path.join(__dirname, '../..', ceoImagePath);
    const recipientFullPath = path.join(__dirname, '../..', recipientImagePath);
    
    // Load and prepare user photos as circular images with solid white background
    const photoSize = 350;
    
    // Create CEO photo as a circle with transparent background
    const ceoCircular = await sharp(ceoFullPath)
      .resize(photoSize, photoSize, { fit: 'cover', position: 'center' })
      .composite([{
        input: Buffer.from(`<svg width="${photoSize}" height="${photoSize}">
          <circle cx="${photoSize/2}" cy="${photoSize/2}" r="${photoSize/2}" fill="white"/>
        </svg>`),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
    
    // Create recipient photo as a circle with transparent background
    const recipientCircular = await sharp(recipientFullPath)
      .resize(photoSize, photoSize, { fit: 'cover', position: 'center' })
      .composite([{
        input: Buffer.from(`<svg width="${photoSize}" height="${photoSize}">
          <circle cx="${photoSize/2}" cy="${photoSize/2}" r="${photoSize/2}" fill="white"/>
        </svg>`),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
    
    const width = 1200;
    const height = 800;
    
    // Create festive SVG background with wreaths
    const festiveSVG = `
      <svg width="${width}" height="${height}">
        <!-- Christmas gradient background -->
        <defs>
          <linearGradient id="christmasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a3d0a;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#165016;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b0000;stop-opacity:1" />
          </linearGradient>
          
          <!-- Radial gradient for depth -->
          <radialGradient id="depthGrad" cx="50%" cy="50%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.3" />
          </radialGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#christmasGrad)"/>
        <rect width="${width}" height="${height}" fill="url(#depthGrad)"/>
        
        <!-- Snowflakes -->
        <circle cx="100" cy="100" r="4" fill="white" opacity="0.8"/>
        <circle cx="200" cy="150" r="3" fill="white" opacity="0.7"/>
        <circle cx="1050" cy="120" r="5" fill="white" opacity="0.9"/>
        <circle cx="950" cy="180" r="3" fill="white" opacity="0.6"/>
        <circle cx="1100" cy="250" r="4" fill="white" opacity="0.8"/>
        <circle cx="150" cy="650" r="5" fill="white" opacity="0.7"/>
        <circle cx="1000" cy="680" r="4" fill="white" opacity="0.8"/>
        <circle cx="600" cy="80" r="3" fill="white" opacity="0.7"/>
        <circle cx="300" cy="700" r="4" fill="white" opacity="0.6"/>
        <circle cx="900" cy="600" r="3" fill="white" opacity="0.7"/>
        
        <!-- Stars -->
        <text x="120" y="250" font-size="50" fill="gold" opacity="0.9">✨</text>
        <text x="1020" y="350" font-size="45" fill="gold" opacity="0.8">✨</text>
        <text x="550" y="700" font-size="40" fill="gold" opacity="0.9">⭐</text>
        <text x="200" y="500" font-size="35" fill="gold" opacity="0.7">⭐</text>
        <text x="950" y="550" font-size="38" fill="gold" opacity="0.8">✨</text>
        
        <!-- Christmas trees in corners -->
        <text x="50" y="750" font-size="80" fill="#2d5016">🎄</text>
        <text x="1070" y="750" font-size="80" fill="#2d5016">🎄</text>
        
        <!-- Title banner -->
        <rect x="250" y="40" width="700" height="100" rx="20" fill="#c41e3a" opacity="0.95"/>
        <rect x="250" y="40" width="700" height="100" rx="20" fill="url(#depthGrad)" opacity="0.3"/>
        <text x="600" y="105" font-family="Arial, sans-serif" font-size="60" font-weight="bold" 
              fill="white" text-anchor="middle" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5)">
          Merry Christmas!
        </text>
        
        <!-- Decorative holly -->
        <text x="220" y="100" font-size="50">🎄</text>
        <text x="930" y="100" font-size="50">🎄</text>
      </svg>
    `;
    
    // Create wreath SVG overlays for the photos
    const wreathSize = photoSize + 60;
    const wreathSVG = `
      <svg width="${wreathSize}" height="${wreathSize}">
        <!-- Outer gold ring -->
        <circle cx="${wreathSize/2}" cy="${wreathSize/2}" r="${wreathSize/2 - 5}" 
                fill="none" stroke="#d4af37" stroke-width="12" opacity="0.9"/>
        
        <!-- Inner decorative ring -->
        <circle cx="${wreathSize/2}" cy="${wreathSize/2}" r="${wreathSize/2 - 20}" 
                fill="none" stroke="#228b22" stroke-width="8" opacity="0.8"/>
        
        <!-- Holly berries (red dots) -->
        <circle cx="${wreathSize/2}" cy="15" r="6" fill="#c41e3a"/>
        <circle cx="${wreathSize/2 + 10}" cy="20" r="5" fill="#c41e3a"/>
        <circle cx="${wreathSize/2 - 10}" cy="20" r="5" fill="#c41e3a"/>
        
        <circle cx="${wreathSize/2}" cy="${wreathSize - 15}" r="6" fill="#c41e3a"/>
        <circle cx="${wreathSize/2 + 10}" cy="${wreathSize - 20}" r="5" fill="#c41e3a"/>
        <circle cx="${wreathSize/2 - 10}" cy="${wreathSize - 20}" r="5" fill="#c41e3a"/>
        
        <circle cx="15" cy="${wreathSize/2}" r="6" fill="#c41e3a"/>
        <circle cx="20" cy="${wreathSize/2 + 10}" r="5" fill="#c41e3a"/>
        <circle cx="20" cy="${wreathSize/2 - 10}" r="5" fill="#c41e3a"/>
        
        <circle cx="${wreathSize - 15}" cy="${wreathSize/2}" r="6" fill="#c41e3a"/>
        <circle cx="${wreathSize - 20}" cy="${wreathSize/2 + 10}" r="5" fill="#c41e3a"/>
        <circle cx="${wreathSize - 20}" cy="${wreathSize/2 - 10}" r="5" fill="#c41e3a"/>
      </svg>
    `;
    
    const wreathBuffer = await sharp(Buffer.from(wreathSVG))
      .png()
      .toBuffer();
    
    // Position photos with wreaths
    const leftPhotoX = 200;
    const rightPhotoX = 650;
    const photoY = 250;
    
    const wreathOffset = (wreathSize - photoSize) / 2;
    
    // Create the final composite
    const outputFilename = `festive-card-${Date.now()}.jpg`;
    const outputPath = path.join(uploadsDir, outputFilename);
    
    // First convert SVG background to PNG
    const backgroundBuffer = await sharp(Buffer.from(festiveSVG))
      .png()
      .toBuffer();
    
    // Then composite everything and convert to JPEG
    await sharp(backgroundBuffer)
      .composite([
        // Left photo (circular with transparent background)
        { input: ceoCircular, left: leftPhotoX, top: photoY },
        // Left wreath
        { input: wreathBuffer, left: leftPhotoX - wreathOffset, top: photoY - wreathOffset },
        // Right photo (circular with transparent background)
        { input: recipientCircular, left: rightPhotoX, top: photoY },
        // Right wreath
        { input: wreathBuffer, left: rightPhotoX - wreathOffset, top: photoY - wreathOffset },
      ])
      .png()  // Convert to PNG first to handle transparency properly
      .toBuffer()
      .then(buffer => sharp(buffer).jpeg({ quality: 95 }).toFile(outputPath));
    
    console.log('Festive composite with wreaths created successfully!');
    return `/uploads/${outputFilename}`;
  } catch (error) {
    console.error('Error creating festive composite:', error);
    throw error;
  }
}
