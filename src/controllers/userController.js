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
exports.registerUser = void 0;
const karmaService_1 = require("../karmaServices/karmaService");
const db_1 = __importDefault(require("../db"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, bvn } = req.body;
    try {
        const isBlacklisted = yield (0, karmaService_1.checkKarmaBlacklist)(bvn);
        if (isBlacklisted) {
            return res.status(403).json({
                message: "User is blacklisted by Adjutor Karma.",
            });
        }
        yield db_1.default.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
            const [user] = yield trx("users")
                .insert({ name, email, bvn })
                .returning("*");
            yield trx("wallets").insert({
                user_id: user.id,
                balance: 0,
            });
            res.status(201).json({
                message: "User registered successfully",
                user,
            });
        }));
    }
    catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown registration error",
        });
    }
});
exports.registerUser = registerUser;
