import request from 'supertest';
import app from '../app';
import Destination from '../models/Destination';
import Experience from '../models/Experience';

let testDestination: any;
let testExperience: any;

describe('Search Endpoints', () => {
  beforeAll(async () => {
    // Reset the schema for a clean state
    await Destination.sequelize?.sync({ force: true });
    // Seed a destination
    testDestination = await Destination.create({
      name: 'Beach Paradise',
      description: 'A beautiful beach.',
      location: 'Maldives',
      image_url: 'http://example.com/beach.jpg',
    });
    // Seed an experience
    testExperience = await Experience.create({
      name: 'Skydiving',
      description: 'Jump from the sky!',
      type: 'Adventure',
      price: 200,
      currency: 'USD',
      destination_id: testDestination.id,
    });
  });

  afterAll(async () => {
    await Experience.destroy({ where: { id: testExperience.id } });
    await Destination.destroy({ where: { id: testDestination.id } });
  });

  it('should search destinations by name', async () => {
    const response = await request(app).get('/destinations/search').query({ name: 'Beach' });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('name');
  });

  it('should search destinations by location', async () => {
    const response = await request(app).get('/destinations/search').query({ location: 'Maldives' });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('location', 'Maldives');
  });

  it('should search experiences by name', async () => {
    const response = await request(app).get('/experiences/search').query({ name: 'Skydiving' });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('name');
  });

  it('should filter experiences by price range', async () => {
    const response = await request(app).get('/experiences/search').query({ minPrice: 100, maxPrice: 500 });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('price');
    expect(response.body[0].price).toBeGreaterThanOrEqual(100);
    expect(response.body[0].price).toBeLessThanOrEqual(500);
  });
});