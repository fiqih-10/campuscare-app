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
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Get all admins
router.get('/admins', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || user.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    try {
        const admins = yield prisma_1.default.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, username: true, role: true, createdAt: true }
        });
        res.json(admins);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
// Create new admin
router.post('/admins', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || user.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const existingUser = yield prisma_1.default.user.findUnique({ where: { username } });
        if (existingUser)
            return res.status(400).json({ message: 'Username already exists' });
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newAdmin = yield prisma_1.default.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'ADMIN',
            },
            select: { id: true, username: true, role: true, createdAt: true }
        });
        res.status(201).json(newAdmin);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
// Delete admin
router.delete('/admins/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || user.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    const id = req.params.id;
    if (id === user.id) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    try {
        yield prisma_1.default.user.delete({ where: { id } });
        res.json({ message: 'Admin deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
exports.default = router;
