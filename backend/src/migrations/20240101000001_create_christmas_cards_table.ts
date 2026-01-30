import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('christmas_cards', (table) => {
    table.increments('id').primary();
    table.integer('sender_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('recipient_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('ceo_message').notNullable();
    table.text('ai_generated_message');
    table.string('festive_image_url');
    table.string('card_token').notNullable().unique();
    table.boolean('viewed').defaultTo(false);
    table.timestamp('viewed_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('christmas_cards');
}
