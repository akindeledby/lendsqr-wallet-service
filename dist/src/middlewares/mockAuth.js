"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAuth = mockAuth;
function mockAuth(req, res, next) {
    const userId = req.headers["x-user-id"];
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = { id: Number(userId) };
    next();
}
