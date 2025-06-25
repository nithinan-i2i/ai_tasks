import express, { Request, Response } from 'express';
import { Op } from 'sequelize';
import Destination from '../models/Destination';
import Experience from '../models/Experience';

const router = express.Router();

// Logging middleware
router.use((req, res, next) => {
  console.log(`Search route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Search and filter destinations
router.get('/destinations/search', async (req: Request, res: Response) => {
  const { name, location, rating } = req.query;
  const where: any = {};

  if (name) where.name = { [Op.like]: `%${name}%` };
  if (location) where.location = { [Op.like]: `%${location}%` };
  if (rating) where.rating = { [Op.gte]: Number(rating) };

  try {
    const destinations = await Destination.findAll({ where });
    res.json(destinations);
  } catch (error) {
    console.error('Destination search error:', error);
    res.status(500).json({ message: 'Error searching destinations', error });
  }
});

// Search and filter experiences
router.get('/experiences/search', async (req: Request, res: Response) => {
  const { name, type, minPrice, maxPrice } = req.query;
  const where: any = {};

  if (name) where.name = { [Op.like]: `%${name}%` };
  if (type) where.type = { [Op.eq]: type };
  if (minPrice) where.price = { [Op.gte]: Number(minPrice) };
  if (maxPrice) where.price = { ...where.price, [Op.lte]: Number(maxPrice) };

  try {
    const experiences = await Experience.findAll({ where });
    res.json(experiences);
  } catch (error) {
    console.error('Experience search error:', error);
    res.status(500).json({ message: 'Error searching experiences', error });
  }
});

export default router;