import { Request, Response } from "express";
import { checkKarmaBlacklist } from "../karmaServices/karmaService";
import db from "../db";
import bcrypt from "bcryptjs";

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, bvn, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  try {
    const isBlacklisted = await checkKarmaBlacklist(bvn);
    if (isBlacklisted) {
      return res.status(403).json({
        message: "User is blacklisted by Adjutor Karma.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.transaction(async (trx) => {
      const [user] = await trx("users")
        .insert({ name, email, password: hashedPassword, bvn })
        .returning("*");

      await trx("wallets").insert({
        user_id: user.id,
        balance: 0,
      });

      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword,
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
