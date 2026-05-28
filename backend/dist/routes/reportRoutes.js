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
const prisma_1 = __importDefault(require("../prisma"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const server_1 = require("../server");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, path_1.default.join(__dirname, '../../uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
// Create report
router.post('/', authMiddleware_1.authenticateToken, upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, category, description, isAnonymous } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const report = yield prisma_1.default.report.create({
            data: {
                title,
                category,
                description,
                isAnonymous: isAnonymous === 'true' || isAnonymous === true,
                userId,
                imageUrl,
            },
            include: { user: { select: { username: true } } }
        });
        // Emit to admins that a new report was created
        server_1.io.emit('reportCreated', report);
        res.status(201).json(report);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
// Get reports
router.get('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        let reports;
        if (user.role === 'ADMIN') {
            reports = yield prisma_1.default.report.findMany({
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true } } }
            });
        }
        else {
            reports = yield prisma_1.default.report.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true } } }
            });
        }
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
// Update report status (Admin only)
router.patch('/:id/status', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { status, adminComment } = req.body;
    const user = req.user;
    if (!user || user.role !== 'ADMIN')
        return res.status(403).json({ message: 'Forbidden' });
    try {
        const updatedReport = yield prisma_1.default.report.update({
            where: { id },
            data: { status, adminComment },
            include: { user: { select: { username: true } } }
        });
        // Emit event for realtime updates
        server_1.io.emit('reportUpdated', updatedReport);
        res.json(updatedReport);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
// Delete report
router.delete('/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const user = req.user;
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const report = yield prisma_1.default.report.findUnique({ where: { id } });
        if (!report)
            return res.status(404).json({ message: 'Not found' });
        if (user.role !== 'ADMIN' && report.userId !== user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // Only allow user to delete if status is PENDING (Admin can delete anytime)
        if (user.role !== 'ADMIN' && report.status !== 'PENDING') {
            return res.status(403).json({ message: 'Cannot delete processed report' });
        }
        yield prisma_1.default.report.delete({ where: { id } });
        server_1.io.emit('reportDeleted', id);
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
// Update report (User edit)
router.put('/:id', authMiddleware_1.authenticateToken, upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { title, category, description, isAnonymous } = req.body;
    const user = req.user;
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const report = yield prisma_1.default.report.findUnique({ where: { id } });
        if (!report)
            return res.status(404).json({ message: 'Not found' });
        if (report.userId !== user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (report.status !== 'PENDING') {
            return res.status(403).json({ message: 'Cannot edit processed report' });
        }
        const data = {
            title,
            category,
            description,
            isAnonymous: isAnonymous === 'true' || isAnonymous === true,
        };
        if (req.file) {
            data.imageUrl = `/uploads/${req.file.filename}`;
        }
        const updatedReport = yield prisma_1.default.report.update({
            where: { id },
            data,
            include: { user: { select: { username: true } } }
        });
        server_1.io.emit('reportUpdated', updatedReport);
        res.json(updatedReport);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
exports.default = router;
