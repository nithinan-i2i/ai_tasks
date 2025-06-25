import express, { Request, Response } from 'express';
import Review from '../models/Review';

const router = express.Router();

// Create a new review
router.post('/reviews', async (req: Request, res: Response) => {
  const { user_id, destination_id, rating, comment } = req.body;
  try {
    const review = await Review.create({ user_id, destination_id, rating, comment });
    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error });
  }
});

// Get reviews for a specific destination
router.get('/destinations/:id/reviews', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const reviews = await Review.findAll({ where: { destination_id: id } });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews', error });
  }
});

export default router;