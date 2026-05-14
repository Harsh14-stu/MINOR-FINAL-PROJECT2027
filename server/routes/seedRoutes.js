const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Driver = require('../models/Driver');
const Route = require('../models/Route');

router.get('/', async (req, res) => {
  try {
    // Clear existing
    await Student.deleteMany({});
    await Driver.deleteMany({});
    await Route.deleteMany({});

    // Seed Students
    const students = [
      { name:'Aarav Sharma', studentId:'STU-001', class:'10-A', assignedBus:'MP-09', photo:'A', pickup:'Vijay nagar', drop:'School Campus', phone:'+91 9876543001', parentName:'Rajesh Sharma', parentPhone:'+91 9876543100', RFID:'RFID-1001', feeTotal:12000, feePaid:9000, feeDue:3000, attendance:92, sos:false, history:['07:05 Boarded MP-09','07:32 Reached School','14:30 Boarded Return'] },
      { name:'Priya Patel', studentId:'STU-002', class:'9-B', assignedBus:'MP-09', photo:'P', pickup:'Raddision square', drop:'School Campus', phone:'+91 9876543002', parentName:'Suresh Patel', parentPhone:'+91 9876543101', RFID:'RFID-1002', feeTotal:12000, feePaid:12000, feeDue:0, attendance:98, sos:false, history:['07:10 Boarded MP-09','07:45 Reached School'] },
      { name:'Rahul Verma', studentId:'STU-003', class:'8-C', assignedBus:'MP-09', photo:'R', pickup:'Scheme 78', drop:'School Campus', phone:'+91 9876543003', parentName:'Anil Verma', parentPhone:'+91 9876543102', RFID:'RFID-1003', feeTotal:12000, feePaid:6000, feeDue:6000, attendance:78, sos:false, history:['07:08 Boarded MP-09','07:32 Reached School'] },
      { name:'Sneha Gupta', studentId:'STU-004', class:'11-A', assignedBus:'MP-04', photo:'S', pickup:'Robot Square', drop:'School Campus', phone:'+91 9876543004', parentName:'Vivek Gupta', parentPhone:'+91 9876543103', RFID:'RFID-1004', feeTotal:12000, feePaid:12000, feeDue:0, attendance:95, sos:false, history:['07:00 Boarded MP-04','07:28 Reached School'] },
      { name:'Arjun Mehta', studentId:'STU-005', class:'7-B', assignedBus:'MP-09', photo:'A', pickup:'Palasiya', drop:'School Campus', phone:'+91 9876543005', parentName:'Deepak Mehta', parentPhone:'+91 9876543104', RFID:'RFID-1005', feeTotal:12000, feePaid:3000, feeDue:9000, attendance:65, sos:false, history:['07:15 Boarded MP-09'] },
      { name:'Kavya Nair', studentId:'STU-006', class:'12-S', assignedBus:'MP-04', photo:'K', pickup:'LIG', drop:'School Campus', phone:'+91 9876543006', parentName:'Rajan Nair', parentPhone:'+91 9876543105', RFID:'RFID-1006', feeTotal:12000, feePaid:12000, feeDue:0, attendance:100, sos:false, history:['07:02 Boarded MP-04','07:28 Reached School'] },
    ];
    await Student.insertMany(students);

    // Seed Drivers
    const drivers = [
      { driverId: 'DRV-001', name: 'Amit Kumar', phone: '+91 9876543210', license: 'MP09 DL 2015 1234', experience: '5 Years', bus: 'MP-09', route: 'City Center → Railway Station', photo: 'A', status: 'Online', tripStatus: 'On Trip', currentStop: 'Bus Stand', nextStop: 'Market Chowk', speed: '42 km/h', lat: 28.6139, lng: 77.2090, history: ['06:30 Logged In', '07:00 Started Trip', '07:45 Reached Checkpoint'] },
      { driverId: 'DRV-002', name: 'Raj Singh', phone: '+91 9876543211', license: 'MP09 DL 2018 5678', experience: '3 Years', bus: 'MP-04', route: 'Vijay Nagar → LIG Square', photo: 'R', status: 'Offline', tripStatus: 'Off duty', currentStop: '-', nextStop: '-', speed: '0 km/h', lat: 28.6200, lng: 77.2180, history: ['14:00 Ended Trip', '14:30 Logged Out'] },
      { driverId: 'DRV-003', name: 'Suresh V.', phone: '+91 9876543212', license: 'MP04 DL 2012 9012', experience: '8 Years', bus: 'DL-05', route: 'Bhawarkua → Scheme 78', photo: 'S', status: 'Online', tripStatus: 'On Trip', currentStop: 'Bhawarkua Square', nextStop: 'Tower Square', speed: '35 km/h', lat: 28.6060, lng: 77.2230, history: ['06:45 Logged In', '07:10 Started Trip'] },
    ];
    await Driver.insertMany(drivers);

    // Seed Routes
    const routes = [
      { 
        routeId: 'RT-01', name: 'City Center → Railway Station', bus: 'MP-09', driver: 'Amit Kumar', status: 'Active', progress: 50, lat: 28.6139, lng: 77.2090,
        stops: [ { name: 'City Center', time: '07:00 AM', completed: true }, { name: 'Bus Stand', time: '07:15 AM', completed: true }, { name: 'Market Chowk', time: '07:30 AM', completed: false }, { name: 'Railway Station', time: '07:45 AM', completed: false } ]
      },
      { 
        routeId: 'RT-02', name: 'Vijay Nagar → LIG Square', bus: 'MP-04', driver: 'Raj Singh', status: 'Inactive', progress: 0, lat: 28.6200, lng: 77.2180,
        stops: [ { name: 'Vijay Nagar', time: '08:00 AM', completed: false }, { name: 'Bapat Square', time: '08:15 AM', completed: false }, { name: 'LIG Square', time: '08:30 AM', completed: false } ]
      },
      { 
        routeId: 'RT-03', name: 'Bhawarkua → Scheme 78', bus: 'DL-05', driver: 'Suresh V.', status: 'Active', progress: 75, lat: 28.6060, lng: 77.2230,
        stops: [ { name: 'Bhawarkua Square', time: '06:45 AM', completed: true }, { name: 'Tower Square', time: '07:00 AM', completed: true }, { name: 'Navlakha', time: '07:15 AM', completed: true }, { name: 'Scheme 78', time: '07:30 AM', completed: false } ]
      }
    ];
    await Route.insertMany(routes);

    res.json({ message: 'Database seeded successfully with mock data!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
