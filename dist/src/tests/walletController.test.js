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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../src/index"));
const db_1 = __importDefault(require("../db"));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.migrate.latest();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.destroy();
}));
describe("Wallet Operations", () => {
    let userId1;
    let userId2;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_1.default)("transactions").del();
        yield (0, db_1.default)("wallets").del();
        yield (0, db_1.default)("users").del();
        const [user1] = yield (0, db_1.default)("users")
            .insert({
            name: "Alice",
            email: "akindele@example.com",
            bvn: "11111111111",
        })
            .returning("*");
        const [user2] = yield (0, db_1.default)("users")
            .insert({
            name: "Bob",
            email: "adebayo@example.com",
            bvn: "22222222222",
        })
            .returning("*");
        yield (0, db_1.default)("wallets").insert([
            { user_id: user1.id, balance: 0 },
            { user_id: user2.id, balance: 0 },
        ]);
        userId1 = user1.id;
        userId2 = user2.id;
    }));
    it("should fund the user's wallet", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/wallet/fund")
            .set("x-user-id", userId1.toString())
            .send({ amount: 1000 });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/funded/i);
        const wallet = yield (0, db_1.default)("wallets").where({ user_id: userId1 }).first();
        expect(Number(wallet.balance)).toBe(1000);
    }));
    it("should withdraw funds from the user's wallet", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_1.default)("wallets").where({ user_id: userId1 }).update({ balance: 1500 });
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/wallet/withdraw")
            .set("x-user-id", userId1.toString())
            .send({ amount: 500 });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/Withdrawal successful/i);
        const wallet = yield (0, db_1.default)("wallets").where({ user_id: userId1 }).first();
        expect(Number(wallet.balance)).toBe(1000);
    }));
    it("should fail withdrawal if balance is insufficient", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/wallet/withdraw")
            .set("x-user-id", userId1.toString())
            .send({ amount: 1000 });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/Withdrawal failed/i);
    }));
    it("should transfer funds from one user to another", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_1.default)("wallets").where({ user_id: userId1 }).update({ balance: 2000 });
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/wallet/transfer")
            .set("x-user-id", userId1.toString())
            .send({ receiverId: userId2, amount: 750 });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/Transfer successful/i);
        const senderWallet = yield (0, db_1.default)("wallets")
            .where({ user_id: userId1 })
            .first();
        const receiverWallet = yield (0, db_1.default)("wallets")
            .where({ user_id: userId2 })
            .first();
        expect(Number(senderWallet.balance)).toBe(1250);
        expect(Number(receiverWallet.balance)).toBe(750);
    }));
    it("should fail transfer if sender has insufficient balance", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/wallet/transfer")
            .set("x-user-id", userId1.toString())
            .send({ receiverId: userId2, amount: 3000 });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/Transfer failed/i);
    }));
});
