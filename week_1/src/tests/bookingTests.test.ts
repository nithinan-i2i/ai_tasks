import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Destination from '../models/Destination';
import Experience from '../models/Experience';
import Booking from '../models/Booking';

describe('Booking Endpoints', () => {
  let createdBookingId: string;
  let testUser: any;
  let testDestination: any;
  let testExperience: any;

  beforeAll(async () => {
    // Reset schema for a clean state
    await Booking.sequelize?.sync({ force: true });
    // Seed user
    testUser = await User.create({
      email: 'testuser@example.com',
      password_hash: 'hashedpassword',
      first_name: 'Test',
      last_name: 'User',
      phone_number: '1234567890',
    });
    // Seed destination
    testDestination = await Destination.create({
      name: 'Test Destination',
      description: 'A test destination',
      location: 'Test Location',
      image_url: 'http://example.com/test.jpg',
    });
    // Seed experience
    testExperience = await Experience.create({
      name: 'Test Experience',
      description: 'A test experience',
      type: 'Adventure',
      price: 100,
      currency: 'USD',
      destination_id: testDestination.id,
    });
  });

  afterAll(async () => {
    await Booking.destroy({ where: {} });
    await Experience.destroy({ where: { id: testExperience.id } });
    await Destination.destroy({ where: { id: testDestination.id } });
    await User.destroy({ where: { id: testUser.id } });
  });

  it('should create a new booking', async () => {
    const response = await request(app)
      .post('/bookings')
      .send({
        user_id: testUser.id,
        experience_id: testExperience.id,
        booking_date: '2025-06-20',
      });

    if (response.status !== 201) {
      console.error('Booking creation error:', response.body);
    }
    expect(response.status).toBe(201);
    expect(response.body.booking).toHaveProperty('id');
    createdBookingId = response.body.booking.id;
  });

  it('should retrieve all bookings', async () => {
    const response = await request(app).get('/bookings');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should retrieve a specific booking by ID', async () => {
    const response = await request(app).get(`/bookings/${createdBookingId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdBookingId);
  });

  it('should cancel a booking', async () => {
    const response = await request(app).post(`/bookings/${createdBookingId}/cancel`);
    expect(response.status).toBe(200);
    expect(response.body.booking).toHaveProperty('status', 'canceled');
  });
});