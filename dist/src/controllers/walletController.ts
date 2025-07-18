import { Request, Response } from "express";
import db from "../db";

export const fundWallet = async (req: Request, res: Response) => {
  const userId = req.user?.id as number;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  try {
    await db.transaction(async (trx) => {
      const wallet = await trx("wallets").where({ user_id: userId }).first();

      if (!wallet) throw new Error("Wallet not found");

      await trx("wallets")
        .where({ user_id: userId })
        .update({ balance: Number(wallet.balance) + Number(amount) });

      await trx("transactions").insert({
        sender_id: null,
        receiver_id: userId,
        amount,
        type: "FUND",
        description: `Wallet funded with ₦${amount}`,
      });
    });

    res.status(200).json({ message: "Wallet funded successfully" });
  } catch (err) {
    if (err instanceof Error) {
      return res
        .status(500)
        .json({ message: "Transfer failed", error: err.message });
    }
    return res
      .status(500)
      .json({ message: "Transfer failed", error: String(err) });
  }
};

export const withdrawFunds = async (req: Request, res: Response) => {
  const userId = req.user?.id as number;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  try {
    await db.transaction(async (trx) => {
      const wallet = await trx("wallets").where({ user_id: userId }).first();

      if (!wallet || Number(wallet.balance) < amount) {
        throw new Error("Insufficient balance");
      }

      await trx("wallets")
        .where({ user_id: userId })
        .update({ balance: Number(wallet.balance) - Number(amount) });

      await trx("transactions").insert({
        sender_id: userId,
        receiver_id: null,
        amount,
        type: "WITHDRAW",
        description: `Wallet withdrawn: ₦${amount}`,
      });
    });

    res.status(200).json({ message: "Withdrawal successful" });
  } catch (err) {
    if (err instanceof Error) {
      return res
        .status(500)
        .json({ message: "Transfer failed", error: err.message });
    }
    return res
      .status(500)
      .json({ message: "Transfer failed", error: String(err) });
  }
};

export const transferFunds = async (req: Request, res: Response) => {
  const userId = req.user?.id as number;
  const { receiverId, amount } = req.body;

  if (!receiverId || !amount || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Receiver ID and valid amount are required" });
  }

  try {
    await db.transaction(async (trx) => {
      const senderWallet = await trx("wallets")
        .where({ user_id: userId })
        .first();
      const receiverWallet = await trx("wallets")
        .where({ user_id: receiverId })
        .first();

      if (!senderWallet || !receiverWallet) {
        throw new Error("Sender or Receiver wallet not found");
      }

      if (Number(senderWallet.balance) < amount) {
        throw new Error("Insufficient balance");
      }

      await trx("wallets")
        .where({ user_id: userId })
        .update({ balance: Number(senderWallet.balance) - Number(amount) });

      await trx("wallets")
        .where({ user_id: receiverId })
        .update({ balance: Number(receiverWallet.balance) + Number(amount) });

      await trx("transactions").insert({
        sender_id: userId,
        receiver_id: receiverId,
        amount,
        type: "TRANSFER",
        description: `Transferred ₦${amount} from user ${userId} to ${receiverId}`,
      });
    });

    res.status(200).json({ message: "Transfer successful" });
  } catch (err) {
    if (err instanceof Error) {
      return res
        .status(500)
        .json({ message: "Transfer failed", error: err.message });
    }
    return res
      .status(500)
      .json({ message: "Transfer failed", error: String(err) });
  }
};
