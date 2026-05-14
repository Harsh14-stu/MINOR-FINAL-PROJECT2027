const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/busDB')
  .then(async () => {
    console.log('MongoDB Connected to remote Atlas cluster');
    const User = require('./models/User');
    const existingAdmin = await User.findOne({ email: 'harshraghuwanshi7788@gmail.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Harsh Admin',
        email: 'harshraghuwanshi7788@gmail.com',
        password: 'admin',
        role: 'admin'
      });
      console.log('Default Admin harshraghuwanshi7788@gmail.com created with password "admin"');
    }
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Blackbox Backend LIVE!',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/studentRoutes');
const driverRoutes = require('./routes/driverRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const routeRoutes = require('./routes/routeRoutes');
const tripRoutes = require('./routes/tripRoutes');
const alertRoutes = require('./routes/alertRoutes');
const feeRoutes = require('./routes/feeRoutes');
const seedRoutes = require('./routes/seedRoutes');
const driverApiRoutes = require('./routes/driverApiRoutes');
const studentApiRoutes = require('./routes/studentApiRoutes');
const parentRoutes = require('./routes/parentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/driver', driverApiRoutes);
app.use('/api/student', studentApiRoutes);
app.use('/api/parent', parentRoutes);

// ADMIN Dashboard Real DB Stats
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const User = require('./models/User');
    const Vehicle = require('./models/Vehicle');
    
    const totalBuses = await Vehicle.countDocuments();
    const activeBuses = await Vehicle.countDocuments({ status: 'moving' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalParents = await User.countDocuments({ role: 'parent' });

    res.json({
      success: true,
      stats: {
        totalBuses,
        activeBuses,
        totalDrivers,
        totalStudents,
        totalParents,
        alerts: 0,
        recentBuses: []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// Start Server - Create HTTP server first
const server = http.createServer(app);

// Socket.IO (Real-time) - Initialize AFTER server creation
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

const GPSSimulator = require('./services/gpsSimulator');
const simulator = new GPSSimulator(io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('gps-update', (data) => {
    socket.broadcast.emit('bus-location', data);
  });
  
  socket.on('emergency', (data) => {
    io.emit('emergency-alert', data);
  });


  
  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  console.log('Blackbox Backend LIVE!');
  console.log('http://localhost:' + PORT);
  simulator.start(); // Start GPS Simulation
});
