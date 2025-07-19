import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("transactions").del();

  await knex("transactions").insert([
    {
      id: "txn_1",
      sender_id: "wallet_1",
      receiver_id: "wallet_2",
      amount: 1000,
      type: "TRANSFER",
      created_at: new Date(),
    },
    {
      id: "txn_2",
      sender_id: null,
      receiver_id: "wallet_1",
      amount: 5000,
      type: "FUND",
      created_at: new Date(),
    },
  ]);
}
