import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('users', (table) => {
    table.boolean('card_sent_this_season').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('users', (table) => {
    table.dropColumn('card_sent_this_season');
  });
}
