"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send(`
    <h1>Lendsqr Wallet Service</h1>
    <p>Available endpoints:</p>
    <ul>
      <li>POST /api/users/register</li>
      <li>POST /api/wallets/fund</li>
      <li>POST /api/wallets/transfer</li>
      <li>POST /api/wallets/withdraw</li>
    </ul>
  `);
});
app.use("/api/users", userRoutes_1.default);
app.use("/api/wallets", walletRoutes_1.default);
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
exports.default = app;
// import express from "express";
// import userRoutes from "./routes/userRoutes";
// import walletRoutes from "./routes/walletRoutes";
// const app = express();
// app.use(express.json());
// app.use("/api/users", userRoutes);
// app.use("/api/wallets", walletRoutes);
// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });
// export default app;
