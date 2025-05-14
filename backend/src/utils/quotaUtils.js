const schedule = require('node-schedule');
const db = require('../../config/db');

// Schedule weekly quota reset (e.g., every Monday at midnight)
const scheduleQuotaReset = () => {
  schedule.scheduleJob('0 0 * * 1', () => {
    const newQuotaPeriod = new Date().toISOString().slice(0, 10);
    const allocatedLitres = 50; // Example: 50 liters per week
    db.query(
      'UPDATE fuel_quota SET used_litres = 0, allocated_litres = ?, quota_period = ?',
      [allocatedLitres, newQuotaPeriod],
      (err) => {
        if (err) console.error('Quota reset failed:', err);
        else console.log('Weekly quotas reset');
      }
    );
  });
};

module.exports = { scheduleQuotaReset };