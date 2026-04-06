const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

const allowedOrigins = (process.env.CLIENT_URLS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Connect Database
connectDB();

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests like Postman/cURL with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json({ extended: false }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/notifications', require('./routes/api/notifications'));
app.use('/api/follow', require('./routes/api/follow'));

// Test route
app.get('/', (req, res) => res.send('Sopher API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
