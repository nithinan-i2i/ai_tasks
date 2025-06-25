import express, { Request, Response } from 'express';
import Destination from '../models/Destination';
import redis from '../config/redis';

const router = express.Router();

// Get all destinations
router.get('/destinations', async (req: Request, res: Response): Promise<void> => {
    const cacheKey = 'destinations:all';
    const cached = await redis.get(cacheKey);
    if (cached) {
        res.json(JSON.parse(cached));
        return;
    }

    try {
        const destinations = await Destination.findAll();
        await redis.set(cacheKey, JSON.stringify(destinations), 'EX', 300); // cache for 5 minutes
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving destinations', error });
    }
});

// Get a specific destination by ID
router.get('/destinations/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            res.status(404).json({ message: 'Destination not found' });
            return;
        }

        res.json(destination);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving destination', error });
    }
});

// Create a new destination
router.post('/destinations', async (req: Request, res: Response): Promise<void> => {
    const { name, description, location, image_url } = req.body;

    try {
        const destination = await Destination.create({ name, description, location, image_url });
        await redis.del('destinations:all'); // Invalidate cache
        res.status(201).json({ message: 'Destination created successfully', destination });
    } catch (error) {
        res.status(500).json({ message: 'Error creating destination', error });
    }
});

// Update an existing destination
router.put('/destinations/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, location, image_url } = req.body;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            res.status(404).json({ message: 'Destination not found' });
            return;
        }

        await destination.update({ name, description, location, image_url });
        await redis.del('destinations:all'); // Invalidate cache
        res.json({ message: 'Destination updated successfully', destination });
    } catch (error) {
        res.status(500).json({ message: 'Error updating destination', error });
    }
});

// Delete a destination
router.delete('/destinations/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            res.status(404).json({ message: 'Destination not found' });
            return;
        }

        await destination.destroy();
        await redis.del('destinations:all'); // Invalidate cache
        res.json({ message: 'Destination deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting destination', error });
    }
});

export default router;