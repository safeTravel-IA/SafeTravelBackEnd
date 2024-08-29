// Import dependencies
import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http'; // For creating an HTTP server
import { Server } from 'socket.io'; // Import Socket.IO server
import routes from './routes/routes.js'; // Routes file import
import { notFoundError, errorHandler } from './middlewares/error-handler.js';
import destinations from './data/destinations.json' assert { type: 'json' }; // Add the assertion
import Destination from './models/destination.js'; // Adjust path as needed

const app = express();
const PORT = process.env.PORT || 3000;

// Create an HTTP server to use with Socket.IO
const httpServer = createServer(app);

// Initialize Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow cross-origin requests, adjust as needed
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json()); // Parse JSON bodies

// MongoDB Connection
mongoose
  .connect('mongodb://localhost:27017/safetravel?directConnection=true')
  .then(() => console.log('MongoDB connected to safetravel database'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1); // Exit the process if MongoDB connection fails
  });

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  next(); // Proceed to the next middleware or route handler
});

// Response Logging Middleware
app.use((req, res, next) => {
  // Wrap the res.send function to log the status code and response body
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`Response status: ${res.statusCode}`);
    console.log(`Response body: ${body}`);
    return originalSend.apply(this, arguments);
  };
  next();
});

// Socket.IO Connection Event
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle incoming location data from clients
  socket.on('share_location', (data) => {
    console.log('Received location data:', data);

    // Broadcast the location to other connected clients
    socket.broadcast.emit('receive_location', data);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});




// Routes
app.use('/api', routes); // Prefix all routes with /api
app.use(notFoundError);
app.use(errorHandler);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`Error processing request: ${req.method} ${req.url}`);
  console.error(`Error details: ${err.message}`);
  res.status(err.status || 500).send(err.message);
});

// Handle unknown routes (404)
app.use((req, res) => {
  console.log('404 Not Found:', req.originalUrl);
  res.status(404).send('Route not found');
});

// Seed Destinations
const seedDestinations = async () => {
  try {
    // Clear existing data
    await Destination.deleteMany({});
    console.log('Existing destinations cleared');

    // Insert new data
    const result = await Destination.insertMany(destinations);
    console.log('Destinations seeded successfully', result);
  } catch (error) {
    console.error('Error seeding destinations:', error.message);
  }
};

// Call the seed function
seedDestinations();
export { io };


// Start the HTTP Server with Socket.IO
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open your browser and visit http://localhost:${PORT}`);
});
