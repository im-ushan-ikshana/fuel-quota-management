const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// const db = require('./src/config/db'); // Adjust the path as necessary
const userRoutes = require('./src/routes/userRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const fuelStationRoutes = require('./src/routes/fuelStationRoutes');
const fuelQuotaRoutes = require('./src/routes/fuelQuotaRoutes');
const fuelTransactionRoutes = require('./src/routes/fuelTransactionRoutes');
const { scheduleQuotaReset } = require('./src/utils/quotaUtils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/fuel-stations', fuelStationRoutes);
app.use('/api/fuel-quotas', fuelQuotaRoutes);
app.use('/api/fuel-transactions', fuelTransactionRoutes);

// Start server and connect to DB
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
  // Schedule weekly quota reset
  scheduleQuotaReset();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});