import express from "express";
import { registerUser } from "../controllers/userController";

const router = express.Router();

router.post("/users", registerUser);

export default router;
