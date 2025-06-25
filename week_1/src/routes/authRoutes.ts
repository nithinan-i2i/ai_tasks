import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../config/jwt';
import User from '../models/User';
import { authenticate } from '../config/authMiddleware';

const router = express.Router();

// User registration
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ email, password_hash: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// User login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    res.json({ accessToken, refreshToken });
});

// Token refresh
router.post('/refresh', (req: Request, res: Response): void => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
    }

    const decoded = verifyToken(refreshToken);

    if (!decoded || typeof decoded === 'string') {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
    }

    const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });
    res.json({ accessToken });
});

// User retrieval
router.get('/users/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id, {
            attributes: ['id', 'email', 'first_name', 'last_name', 'phone_number'],
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
});

// Profile update
router.put('/users/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { first_name, last_name, phone_number } = req.body;

    try {
        const user = await User.findByPk(id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        await user.update({ first_name, last_name, phone_number });
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
});

export default router;