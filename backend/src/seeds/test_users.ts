import { Knex } from 'knex';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Random name and word generators
const firstNames = ['Alex', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Taylor', 'Avery', 'Quinn', 'Sage', 'River', 'Dakota', 'Phoenix', 'Skyler', 'Rowan', 'Finley'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas'];
const words = ['innovation', 'excellence', 'creativity', 'dedication', 'passion', 'integrity', 'collaboration', 'growth', 'vision', 'leadership', 'teamwork', 'success'];
const colors = [
  { r: 52, g: 152, b: 219 },
  { r: 46, g: 204, b: 113 },
  { r: 155, g: 89, b: 182 },
  { r: 241, g: 196, b: 15 },
  { r: 231, g: 76, b: 60 },
  { r: 26, g: 188, b: 156 },
  { r: 230, g: 126, b: 34 },
  { r: 52, g: 73, b: 94 },
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomUser = () => {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  const word = getRandomElement(words);
  const color = getRandomElement(colors);
  
  return { name, email, word, color };
};

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

  // Generate 2 random test users
  const testUsers = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < 2; i++) {
    let user = generateRandomUser();
    
    // Ensure unique emails
    while (usedEmails.has(user.email)) {
      user = generateRandomUser();
    }
    usedEmails.add(user.email);

    // Check if user already exists
    const existingUser = await knex('users').where({ email: user.email }).first();
    
    if (!existingUser) {
      const picture = await createPlaceholderImage(user.name, user.color);
      testUsers.push({
        email: user.email,
        google_id: `seed-${user.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`,
        name: user.name,
        picture_url: picture,
        word: user.word,
        card_sent_this_season: false,
      });
    }
  }

  // Insert test users
  if (testUsers.length > 0) {
    await knex('users').insert(testUsers);
    console.log(`✅ Seeded ${testUsers.length} random test user(s):`);
    testUsers.forEach(u => console.log(`   - ${u.name} (${u.email})`));
  } else {
    console.log('ℹ️  Test users already exist, skipping seed');
  }
}
