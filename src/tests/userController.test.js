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
jest.mock("../../src/services/karmaService", () => ({
    checkKarmaBlacklist: jest.fn(),
}));
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../src/index"));
const db_1 = __importDefault(require("../db"));
const karmaService_1 = require("../karmaServices/karmaService");
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.migrate.latest();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.destroy();
}));
describe("POST /register", () => {
    it("should register a new user and create a wallet", () => __awaiter(void 0, void 0, void 0, function* () {
        karmaService_1.checkKarmaBlacklist.mockResolvedValue(false);
        const res = yield (0, supertest_1.default)(index_1.default).post("/register").send({
            name: "John Doe",
            email: "adebayo@example.com",
            bvn: "12345678901",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("id");
    }));
    it("should reject blacklisted users", () => __awaiter(void 0, void 0, void 0, function* () {
        karmaService_1.checkKarmaBlacklist.mockResolvedValue(true);
        const res = yield (0, supertest_1.default)(index_1.default).post("/register").send({
            name: "Blocked User",
            email: "blacklist@example.com",
            bvn: "99999999999",
        });
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/blacklisted/i);
    }));
    it("should return 500 if DB fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const dbSpy = jest
            .spyOn(db_1.default, "transaction")
            .mockRejectedValueOnce(new Error("DB error"));
        const res = yield (0, supertest_1.default)(index_1.default).post("/register").send({
            name: "Failing User",
            email: "akindele@example.com",
            bvn: "11223344556",
        });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/Internal Server Error/i);
        dbSpy.mockRestore();
    }));
});
