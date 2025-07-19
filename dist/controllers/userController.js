"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const karmaService_1 = require("../karmaServices/karmaService");
const db_1 = __importDefault(require("../db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const registerUser = async (req, res) => {
    const { name, email, bvn, password } = req.body;
    if (!password) {
        return res.status(400).json({ message: "Password is required." });
    }
    try {
        const isBlacklisted = await (0, karmaService_1.checkKarmaBlacklist)(bvn);
        if (isBlacklisted) {
            return res.status(403).json({
                message: "User is blacklisted by Adjutor Karma.",
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await db_1.default.transaction(async (trx) => {
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
    }
    catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown registration error",
        });
    }
};
exports.registerUser = registerUser;
