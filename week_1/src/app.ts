import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import destinationRoutes from './routes/destinationRoutes';
import experienceRoutes from './routes/experienceRoutes';
import bookingRoutes from './routes/bookingRoutes';
import reviewRoutes from './routes/reviewRoutes';
import searchRoutes from './routes/searchRoutes';
import Destination from './models/Destination';
import logger from './config/logger';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/', searchRoutes);
app.use('/', destinationRoutes);
app.use('/', experienceRoutes);
app.use('/', bookingRoutes);
app.use('/', reviewRoutes);

// Add a basic route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Temporary route for debugging
app.get('/destinations', (req, res) => {
    res.send('Temporary destinations route is working');
});

// Simple test route for debugging
app.get('/test', (req, res) => {
    res.send('Test route is working');
});

console.log('Registering destination routes');
console.log('Registering debugging routes');

// Swagger UI setup
const swaggerDocument = YAML.load('./docs/openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Synchronize the Destination model with the database
if (process.env.NODE_ENV !== 'test') {
  Destination.sync({ alter: true })
    .then(() => console.log('Destination model synchronized with the database'))
    .catch((error) => console.error('Error synchronizing Destination model:', error));
}

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// Export the app instance for use in other files
export default app;