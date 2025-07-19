import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("wallets").del();

  await knex("wallets").insert([
    {
      id: "wallet_1",
      user_id: "user_1",
      balance: 10000,
      created_at: new Date(),
    },
    {
      id: "wallet_2",
      user_id: "user_2",
      balance: 5000,
      created_at: new Date(),
    },
  ]);
}
