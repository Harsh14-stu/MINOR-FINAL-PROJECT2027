const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load Models
const User = require('./models/User');
const Student = require('./models/Student');
const Driver = require('./models/Driver');
const Vehicle = require('./models/Vehicle');
const Route = require('./models/Route');
const Trip = require('./models/Trip');

dotenv.config();

const MONGO_URI = 'mongodb://127.0.0.1:27017/busDB';

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to busDB');

    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Driver.deleteMany({}),
      Vehicle.deleteMany({}),
      Route.deleteMany({}),
      Trip.deleteMany({})
    ]);

    console.log('Creating Admin...');
    const admin = new User({ name: 'Super Admin', email: 'admin@smartbus.com', password: 'admin123', role: 'admin' });
    await admin.save();

    console.log('Creating Parent...');
    const parent = new User({ name: 'Rajesh Parent', email: 'parent@smartbus.com', password: 'admin123', role: 'parent' });
    await parent.save();

    console.log('Creating Driver Auth...');
    const driverUser = new User({ name: 'Amit Driver', email: 'driver@smartbus.com', password: 'admin123', role: 'driver' });
    await driverUser.save();

    console.log('Creating Student Auth...');
    const studentUser = new User({ name: 'Aarav Student', email: 'student@smartbus.com', password: 'admin123', role: 'student' });
    await studentUser.save();

    console.log('Creating Driver Profile...');
    const driver = new Driver({ name: 'Amit Driver', license: 'DL-12345678', phone: '9876543210', userId: driverUser._id });
    await driver.save();

    console.log('Creating Vehicle...');
    const vehicle = new Vehicle({ busNumber: 'MP-09-AB-1234', fuelLevel: 85, status: 'active', driverId: driver._id, capacity: 40 });
    await vehicle.save();

    console.log('Creating Route...');
    const route = new Route({
      name: 'Downtown Express Route A',
      stops: [
        { name: 'City Center', lat: 28.6139, lng: 77.2090, estimatedTime: '07:00 AM' },
        { name: 'Central Park', lat: 28.6180, lng: 77.2120, estimatedTime: '07:15 AM' },
        { name: 'School Campus', lat: 28.6250, lng: 77.2180, estimatedTime: '07:30 AM' }
      ],
      timings: { start: '07:00 AM', end: '07:30 AM' }
    });
    await route.save();

    console.log('Creating Student Profile...');
    const student = new Student({
      name: 'Aarav Student',
      class: '10th Grade A',
      RFID: 'RFID-9876',
      parentContact: parent._id,
      assignedBus: vehicle._id,
      userId: studentUser._id
    });
    await student.save();

    console.log('Creating Active Trip...');
    const trip = new Trip({
      routeId: route._id,
      vehicleId: vehicle._id,
      status: 'active',
      currentStopIndex: 0,
      locationHistory: [{ lat: 28.6139, lng: 77.2090 }], // starting at first stop
      startTime: new Date()
    });
    await trip.save();

    console.log('--- Seeding Completed Successfully! ---');
    console.log('Demo Credentials (Password for all is admin123):');
    console.log('Admin: admin@smartbus.com');
    console.log('Driver: driver@smartbus.com');
    console.log('Parent: parent@smartbus.com');
    console.log('Student: student@smartbus.com');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
