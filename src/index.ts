import express from "express";
import userRoutes from "./routes/userRoutes";
import walletRoutes from "./routes/walletRoutes";

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/wallets", walletRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

export default app;
