const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/busDB')
  .then(async () => {
    const User = require('./models/User');
    const Vehicle = require('./models/Vehicle');
    
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Vehicle.deleteMany({});
    
    console.log('Database cleaned successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
