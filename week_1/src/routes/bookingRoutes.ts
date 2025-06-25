import express, { Request, Response } from 'express';
import Booking from '../models/Booking';

const router = express.Router();

// Create a new booking
router.post('/bookings', async (req: Request, res: Response) => {
  const { user_id, experience_id, booking_date } = req.body;
  try {
    const booking = await Booking.create({ user_id, experience_id, booking_date });
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error });
  }
});

// Get all bookings
router.get('/bookings', async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.findAll();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving bookings', error });
  }
});

// Get a specific booking by ID
router.get('/bookings/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving booking', error });
  }
});

// Cancel a booking
router.post('/bookings/:id/cancel', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    await booking.update({ status: 'canceled' });
    res.json({ message: 'Booking canceled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error canceling booking', error });
  }
});

export default router;