"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferFunds = exports.withdrawFunds = exports.fundWallet = void 0;
const db_1 = __importDefault(require("../db"));
const fundWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    try {
        yield db_1.default.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield trx("wallets").where({ user_id: userId }).first();
            if (!wallet)
                throw new Error("Wallet not found");
            yield trx("wallets")
                .where({ user_id: userId })
                .update({ balance: Number(wallet.balance) + Number(amount) });
            yield trx("transactions").insert({
                sender_id: null,
                receiver_id: userId,
                amount,
                type: "FUND",
                description: `Wallet funded with ₦${amount}`,
            });
        }));
        res.status(200).json({ message: "Wallet funded successfully" });
    }
    catch (err) {
        if (err instanceof Error) {
            return res
                .status(500)
                .json({ message: "Transfer failed", error: err.message });
        }
        return res
            .status(500)
            .json({ message: "Transfer failed", error: String(err) });
    }
});
exports.fundWallet = fundWallet;
const withdrawFunds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    try {
        yield db_1.default.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield trx("wallets").where({ user_id: userId }).first();
            if (!wallet || Number(wallet.balance) < amount) {
                throw new Error("Insufficient balance");
            }
            yield trx("wallets")
                .where({ user_id: userId })
                .update({ balance: Number(wallet.balance) - Number(amount) });
            yield trx("transactions").insert({
                sender_id: userId,
                receiver_id: null,
                amount,
                type: "WITHDRAW",
                description: `Wallet withdrawn: ₦${amount}`,
            });
        }));
        res.status(200).json({ message: "Withdrawal successful" });
    }
    catch (err) {
        if (err instanceof Error) {
            return res
                .status(500)
                .json({ message: "Transfer failed", error: err.message });
        }
        return res
            .status(500)
            .json({ message: "Transfer failed", error: String(err) });
    }
});
exports.withdrawFunds = withdrawFunds;
const transferFunds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { receiverId, amount } = req.body;
    if (!receiverId || !amount || amount <= 0) {
        return res
            .status(400)
            .json({ message: "Receiver ID and valid amount are required" });
    }
    try {
        yield db_1.default.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
            const senderWallet = yield trx("wallets")
                .where({ user_id: userId })
                .first();
            const receiverWallet = yield trx("wallets")
                .where({ user_id: receiverId })
                .first();
            if (!senderWallet || !receiverWallet) {
                throw new Error("Sender or Receiver wallet not found");
            }
            if (Number(senderWallet.balance) < amount) {
                throw new Error("Insufficient balance");
            }
            yield trx("wallets")
                .where({ user_id: userId })
                .update({ balance: Number(senderWallet.balance) - Number(amount) });
            yield trx("wallets")
                .where({ user_id: receiverId })
                .update({ balance: Number(receiverWallet.balance) + Number(amount) });
            yield trx("transactions").insert({
                sender_id: userId,
                receiver_id: receiverId,
                amount,
                type: "TRANSFER",
                description: `Transferred ₦${amount} from user ${userId} to ${receiverId}`,
            });
        }));
        res.status(200).json({ message: "Transfer successful" });
    }
    catch (err) {
        if (err instanceof Error) {
            return res
                .status(500)
                .json({ message: "Transfer failed", error: err.message });
        }
        return res
            .status(500)
            .json({ message: "Transfer failed", error: String(err) });
    }
});
exports.transferFunds = transferFunds;
