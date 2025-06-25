import axios from 'axios';
import request from 'supertest';
import { Server } from 'http';
import app from '../app';

const BASE_URL = 'http://localhost:3000';

interface DestinationResponse {
    destination: {
        id: string;
        name: string;
        description: string;
        location: string;
        image_url?: string;
    };
}

function isAxiosError(error: any): error is { response?: { data: any }; message: string } {
    return error && typeof error.message === 'string' && error.response;
}

async function testEndpoints() {
    try {
        // Test: Create a new destination
        const createResponse = await axios.post<DestinationResponse>(`${BASE_URL}/destinations`, {
            name: 'Test Destination',
            description: 'A test description',
            location: 'Test Location',
            image_url: 'http://example.com/test.jpg',
        });
        console.log('Create Destination Response:', createResponse.data);

        const destinationId = createResponse.data.destination.id;

        // Test: Get all destinations
        const getAllResponse = await axios.get<DestinationResponse[]>(`${BASE_URL}/destinations`);
        console.log('Get All Destinations Response:', getAllResponse.data);

        // Test: Get destination by ID
        const getByIdResponse = await axios.get<DestinationResponse>(`${BASE_URL}/destinations/${destinationId}`);
        console.log('Get Destination by ID Response:', getByIdResponse.data);

        // Test: Update destination
        const updateResponse = await axios.put<DestinationResponse>(`${BASE_URL}/destinations/${destinationId}`, {
            name: 'Updated Test Destination',
            description: 'An updated test description',
            location: 'Updated Test Location',
            image_url: 'http://example.com/updated-test.jpg',
        });
        console.log('Update Destination Response:', updateResponse.data);

        // Test: Delete destination
        const deleteResponse = await axios.delete<DestinationResponse>(`${BASE_URL}/destinations/${destinationId}`);
        console.log('Delete Destination Response:', deleteResponse.data);
    } catch (error) {
        if (isAxiosError(error)) {
            console.error('Error during endpoint testing:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

describe('Experience Endpoints', () => {
    let createdExperienceId: string;

    it('should create a new experience', async () => {
        const response = await request(app)
            .post('/experiences')
            .send({
                name: 'Skydiving Adventure',
                description: 'Experience the thrill of skydiving.',
                type: 'Adventure',
                price: 300.0,
                currency: 'USD',
                destination_id: '1',
            });

        expect(response.status).toBe(201);
        expect(response.body.experience).toHaveProperty('id');
        createdExperienceId = response.body.experience.id;
    });

    it('should retrieve all experiences', async () => {
        const response = await request(app).get('/experiences');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should retrieve a specific experience by ID', async () => {
        const response = await request(app).get(`/experiences/${createdExperienceId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', createdExperienceId);
    });

    it('should update an existing experience', async () => {
        const response = await request(app)
            .put(`/experiences/${createdExperienceId}`)
            .send({
                name: 'Skydiving Adventure - Updated',
                description: 'Experience the thrill of skydiving with a twist.',
                type: 'Adventure',
                price: 350.0,
                currency: 'USD',
                destination_id: '1',
            });

        expect(response.status).toBe(200);
        expect(response.body.experience).toHaveProperty('name', 'Skydiving Adventure - Updated');
    });

    it('should delete an experience', async () => {
        const response = await request(app).delete(`/experiences/${createdExperienceId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Experience deleted successfully');
    });
});

let server: Server;

beforeAll(() => {
  server = app.listen(3001, () => {
    console.log('Test server running on port 3001');
  });
});

afterAll(() => {
  server.close(() => {
    console.log('Test server closed');
  });
});

testEndpoints();