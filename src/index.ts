import express from "express";
import userRoutes from "./routes/userRoutes";
import walletRoutes from "./routes/walletRoutes";

const app = express();
app.use(express.json());

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

app.use("/api/users/register", userRoutes);
app.use("/api/wallets", walletRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

export default app;

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
