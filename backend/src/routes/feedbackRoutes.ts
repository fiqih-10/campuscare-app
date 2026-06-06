import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Create feedback (Student only)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  const user = req.user;

  if (!user || user.role !== 'STUDENT') return res.status(403).json({ message: 'Forbidden' });
  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
    const feedback = await prisma.feedback.create({
      data: {
        message,
        userId: user.id,
      },
      include: { user: { select: { username: true } } }
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get feedbacks (Admin only)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = req.user;

  if (!user || user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } }
    });
    
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
