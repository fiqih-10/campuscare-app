import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Get all admins
router.get('/admins', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, username: true, role: true, createdAt: true }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new admin
router.post('/admins', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'ADMIN',
      },
      select: { id: true, username: true, role: true, createdAt: true }
    });
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete admin
router.delete('/admins/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  const id = req.params.id as string;

  if (id === user.id) {
    return res.status(400).json({ message: 'Cannot delete yourself' });
  }

  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
