import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { io } from '../server';

import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const router = Router();

// Create report
router.post('/', authenticateToken, upload.single('image'), async (req: AuthRequest, res: Response) => {
  const { title, category, description, isAnonymous } = req.body;
  const userId = req.user?.id;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const report = await prisma.report.create({
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
    io.emit('reportCreated', report);

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reports
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    let reports;
    if (user.role === 'ADMIN') {
      reports = await prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } }
      });
    } else {
      reports = await prisma.report.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } }
      });
    }
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update report status (Admin only)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { status, adminComment } = req.body;
  const user = req.user;

  if (!user || user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  try {
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status, adminComment },
      include: { user: { select: { username: true } } }
    });

    // Emit event for realtime updates
    io.emit('reportUpdated', updatedReport);

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete report
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const user = req.user;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return res.status(404).json({ message: 'Not found' });

    if (user.role !== 'ADMIN' && report.userId !== user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Only allow user to delete if status is PENDING (Admin can delete anytime)
    if (user.role !== 'ADMIN' && report.status !== 'PENDING') {
      return res.status(403).json({ message: 'Cannot delete processed report' });
    }

    await prisma.report.delete({ where: { id } });
    
    io.emit('reportDeleted', id);

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update report (User edit)
router.put('/:id', authenticateToken, upload.single('image'), async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { title, category, description, isAnonymous } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return res.status(404).json({ message: 'Not found' });

    if (report.userId !== user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (report.status !== 'PENDING') {
      return res.status(403).json({ message: 'Cannot edit processed report' });
    }

    const data: any = {
      title,
      category,
      description,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
    };

    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data,
      include: { user: { select: { username: true } } }
    });

    io.emit('reportUpdated', updatedReport);

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
