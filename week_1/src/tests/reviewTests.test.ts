import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Destination from '../models/Destination';
import Review from '../models/Review';

describe('Review Endpoints', () => {
  let createdReviewId: string;
  let testUser: any;
  let testDestination: any;

  beforeAll(async () => {
    // Reset schema for a clean state
    await Review.sequelize?.sync({ force: true });
    // Seed user
    testUser = await User.create({
      email: 'reviewuser@example.com',
      password_hash: 'hashedpassword',
      first_name: 'Review',
      last_name: 'User',
      phone_number: '9876543210',
    });
    // Seed destination
    testDestination = await Destination.create({
      name: 'Review Destination',
      description: 'A destination for reviews',
      location: 'Review Land',
      image_url: 'http://example.com/review.jpg',
    });
  });

  afterAll(async () => {
    await Review.destroy({ where: {} });
    await Destination.destroy({ where: { id: testDestination.id } });
    await User.destroy({ where: { id: testUser.id } });
  });

  it('should create a new review', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({
        user_id: testUser.id,
        destination_id: testDestination.id,
        rating: 5,
        comment: 'Amazing experience!',
      });

    expect(response.status).toBe(201);
    expect(response.body.review).toHaveProperty('id');
    createdReviewId = response.body.review.id;
  });

  it('should retrieve reviews for a specific destination', async () => {
    const response = await request(app).get(`/destinations/${testDestination.id}/reviews`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});