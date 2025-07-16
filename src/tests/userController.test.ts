jest.mock("../../src/services/karmaService", () => ({
  checkKarmaBlacklist: jest.fn(),
}));

import request from "supertest";
import app from "../../src/index";
import db from "../db";
import { checkKarmaBlacklist } from "../karmaServices/karmaService";

beforeAll(async () => {
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

describe("POST /register", () => {
  it("should register a new user and create a wallet", async () => {
    (checkKarmaBlacklist as jest.Mock).mockResolvedValue(false);

    const res = await request(app).post("/register").send({
      name: "John Doe",
      email: "adebayo@example.com",
      bvn: "12345678901",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id");
  });

  it("should reject blacklisted users", async () => {
    (checkKarmaBlacklist as jest.Mock).mockResolvedValue(true);

    const res = await request(app).post("/register").send({
      name: "Blocked User",
      email: "blacklist@example.com",
      bvn: "99999999999",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/blacklisted/i);
  });

  it("should return 500 if DB fails", async () => {
    const dbSpy = jest
      .spyOn(db, "transaction")
      .mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).post("/register").send({
      name: "Failing User",
      email: "akindele@example.com",
      bvn: "11223344556",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Internal Server Error/i);

    dbSpy.mockRestore();
  });
});
