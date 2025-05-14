const db = require('../../config/db');

exports.createFuelQuota = (req, res) => {
  const { vehicle_id, allocated_litres, quota_period } = req.body;
  db.query(
    'INSERT INTO fuel_quota (vehicle_id, allocated_litres, quota_period) VALUES (?, ?, ?)',
    [vehicle_id, allocated_litres, quota_period],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Fuel quota created', quota_id: result.insertId });
    }
  );
};

exports.getFuelQuota = (req, res) => {
  const { vehicle_id } = req.params;
  db.query('SELECT * FROM fuel_quota WHERE vehicle_id = ?', [vehicle_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.resetQuotas = (req, res) => {
  const newQuotaPeriod = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const allocatedLitres = 50; // Example: 50 liters per week
  db.query(
    'UPDATE fuel_quota SET used_litres = 0, allocated_litres = ?, quota_period = ?',
    [allocatedLitres, newQuotaPeriod],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Quotas reset' });
    }
  );
};