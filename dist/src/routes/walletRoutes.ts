import express from "express";
import {
  fundWallet,
  transferFunds,
  withdrawFunds,
} from "../controllers/walletController";
import { mockAuth } from "../middlewares/mockAuth";

const router = express.Router();

router.post("/fund", mockAuth, fundWallet);
router.post("/transfer", mockAuth, transferFunds);
router.post("/withdraw", mockAuth, withdrawFunds);

export default router;
