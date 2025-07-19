import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("wallets").del();
  await knex("users").del();

  await knex("users").insert([
    {
      id: "user_1",
      name: "Smith Akindele",
      email: "akindele@example.com",
      bvn: "22234567890",
      password: "hashed_password_1",
      created_at: new Date(),
    },
    {
      id: "user_2",
      name: "John Adebayo",
      email: "john@example.com",
      bvn: "22235456788",
      password: "hashed_password_2",
      created_at: new Date(),
    },
  ]);
}
