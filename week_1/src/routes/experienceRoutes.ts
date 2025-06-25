import express, { Request, Response } from 'express';
import Experience from '../models/Experience';

const router = express.Router();

// Get all experiences
router.get('/experiences', async (req: Request, res: Response) => {
  try {
    const experiences = await Experience.findAll();
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving experiences', error });
  }
});

// Get a specific experience by ID
router.get('/experiences/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const experience = await Experience.findByPk(id);
    if (!experience) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }
    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving experience', error });
  }
});

// Create a new experience
router.post('/experiences', async (req: Request, res: Response) => {
  const { name, description, type, price, currency, destination_id } = req.body;
  try {
    const experience = await Experience.create({ name, description, type, price, currency, destination_id });
    res.status(201).json({ message: 'Experience created successfully', experience });
  } catch (error) {
    res.status(500).json({ message: 'Error creating experience', error });
  }
});

// Update an existing experience
router.put('/experiences/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, type, price, currency, destination_id } = req.body;
  try {
    const experience = await Experience.findByPk(id);
    if (!experience) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }
    await experience.update({ name, description, type, price, currency, destination_id });
    res.json({ message: 'Experience updated successfully', experience });
  } catch (error) {
    res.status(500).json({ message: 'Error updating experience', error });
  }
});

// Delete an experience
router.delete('/experiences/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const experience = await Experience.findByPk(id);
    if (!experience) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }
    await experience.destroy();
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting experience', error });
  }
});

export default router;