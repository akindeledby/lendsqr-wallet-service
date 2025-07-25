import request from "supertest";
import app from "../../src/index";
import db from "../db";

beforeAll(async () => {
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

describe("Wallet Operations", () => {
  let userId1: number;
  let userId2: number;

  beforeEach(async () => {
    await db("transactions").del();
    await db("wallets").del();
    await db("users").del();

    const [user1] = await db("users")
      .insert({
        name: "Alice",
        email: "akindele@example.com",
        bvn: "11111111111",
      })
      .returning("*");

    const [user2] = await db("users")
      .insert({
        name: "Bob",
        email: "adebayo@example.com",
        bvn: "22222222222",
      })
      .returning("*");

    await db("wallets").insert([
      { user_id: user1.id, balance: 0 },
      { user_id: user2.id, balance: 0 },
    ]);

    userId1 = user1.id;
    userId2 = user2.id;
  });

  it("should fund the user's wallet", async () => {
    const res = await request(app)
      .post("/wallet/fund")
      .set("x-user-id", userId1.toString())
      .send({ amount: 1000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/funded/i);

    const wallet = await db("wallets").where({ user_id: userId1 }).first();
    expect(Number(wallet.balance)).toBe(1000);
  });

  it("should withdraw funds from the user's wallet", async () => {
    await db("wallets").where({ user_id: userId1 }).update({ balance: 1500 });

    const res = await request(app)
      .post("/wallet/withdraw")
      .set("x-user-id", userId1.toString())
      .send({ amount: 500 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Withdrawal successful/i);

    const wallet = await db("wallets").where({ user_id: userId1 }).first();
    expect(Number(wallet.balance)).toBe(1000);
  });

  it("should fail withdrawal if balance is insufficient", async () => {
    const res = await request(app)
      .post("/wallet/withdraw")
      .set("x-user-id", userId1.toString())
      .send({ amount: 1000 });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Withdrawal failed/i);
  });

  it("should transfer funds from one user to another", async () => {
    await db("wallets").where({ user_id: userId1 }).update({ balance: 2000 });

    const res = await request(app)
      .post("/wallet/transfer")
      .set("x-user-id", userId1.toString())
      .send({ receiverId: userId2, amount: 750 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Transfer successful/i);

    const senderWallet = await db("wallets")
      .where({ user_id: userId1 })
      .first();
    const receiverWallet = await db("wallets")
      .where({ user_id: userId2 })
      .first();

    expect(Number(senderWallet.balance)).toBe(1250);
    expect(Number(receiverWallet.balance)).toBe(750);
  });

  it("should fail transfer if sender has insufficient balance", async () => {
    const res = await request(app)
      .post("/wallet/transfer")
      .set("x-user-id", userId1.toString())
      .send({ receiverId: userId2, amount: 3000 });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Transfer failed/i);
  });
});
