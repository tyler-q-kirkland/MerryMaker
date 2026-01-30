import { Knex } from 'knex';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function seed(knex: Knex): Promise<void> {
  // Create a simple placeholder image for testing
  const createPlaceholderImage = async (name: string, color: { r: number; g: number; b: number }) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `seed-${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Create a simple colored circle as placeholder
    const svg = `
      <svg width="400" height="400">
        <rect width="400" height="400" fill="rgb(${color.r}, ${color.g}, ${color.b})"/>
        <circle cx="200" cy="200" r="150" fill="white" opacity="0.3"/>
        <text x="200" y="220" font-family="Arial" font-size="60" fill="white" text-anchor="middle" font-weight="bold">
          ${name.split(' ').map(n => n[0]).join('')}
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toFile(filepath);

    return `/uploads/${filename}`;
  };

  // Check if test users already exist
  const existingMax = await knex('users').where({ email: 'max.parker@iss-i.ca' }).first();
  const existingBraxton = await knex('users').where({ email: 'braxton.reimer@iss-i.ca' }).first();

  const testUsers = [];

  // Add Max Parker if doesn't exist
  if (!existingMax) {
    const maxPicture = await createPlaceholderImage('Max Parker', { r: 52, g: 152, b: 219 });
    testUsers.push({
      email: 'max.parker@iss-i.ca',
      google_id: 'seed-max-parker-' + Date.now(),
      name: 'Max Parker',
      picture_url: maxPicture,
      word: 'innovation',
      card_sent_this_season: false,
    });
  }

  // Add Braxton Reimer if doesn't exist
  if (!existingBraxton) {
    const braxtonPicture = await createPlaceholderImage('Braxton Reimer', { r: 46, g: 204, b: 113 });
    testUsers.push({
      email: 'braxton.reimer@iss-i.ca',
      google_id: 'seed-braxton-reimer-' + Date.now(),
      name: 'Braxton Reimer',
      picture_url: braxtonPicture,
      word: 'excellence',
      card_sent_this_season: false,
    });
  }

  // Insert test users
  if (testUsers.length > 0) {
    await knex('users').insert(testUsers);
    console.log(`✅ Seeded ${testUsers.length} test user(s)`);
  } else {
    console.log('ℹ️  Test users already exist, skipping seed');
  }
}
