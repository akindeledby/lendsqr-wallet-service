import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("transactions", (table) => {
    table.increments("id").primary();

    table
      .integer("sender_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table
      .integer("receiver_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.decimal("amount", 14, 2).notNullable();
    table.enu("type", ["FUND", "WITHDRAW", "TRANSFER"]).notNullable();
    table.text("description").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("transactions");
}
