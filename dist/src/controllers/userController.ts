import { Request, Response } from "express";
import { checkKarmaBlacklist } from "../karmaServices/karmaService";
import db from "../db";

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, bvn } = req.body;

  try {
    const isBlacklisted = await checkKarmaBlacklist(bvn);
    if (isBlacklisted) {
      return res.status(403).json({
        message: "User is blacklisted by Adjutor Karma.",
      });
    }

    await db.transaction(async (trx) => {
      const [user] = await trx("users")
        .insert({ name, email, bvn })
        .returning("*");

      await trx("wallets").insert({
        user_id: user.id,
        balance: 0,
      });

      res.status(201).json({
        message: "User registered successfully",
        user,
      });
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error:
        error instanceof Error ? error.message : "Unknown registration error",
    });
  }
};
