"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
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
async function down(knex) {
    await knex.schema.dropTableIfExists("transactions");
}
