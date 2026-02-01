import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Check if Anja already exists
  const existingUser = await knex('users').where({ email: 'anja.kirkland@company.com' }).first();
  
  if (!existingUser) {
    // Insert Anja Kirkland
    await knex('users').insert({
      email: 'anja.kirkland@company.com',
      google_id: 'anja_kirkland_google_id',
      name: 'Anja Kirkland',
      picture_url: '/uploads/anja.png',
      word: null, // She can set this later
    });
    console.log('✓ Anja Kirkland added to database');
  } else {
    console.log('✓ Anja Kirkland already exists in database');
  }
}
