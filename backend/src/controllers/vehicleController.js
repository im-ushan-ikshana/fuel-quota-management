const db = require('../../config/db');
const qrcode = require('qrcode');

const vehicleController = {
  registerVehicle: async (req, res) => {
    const { registration_no, chassis_no, engine_no, user_id } = req.body;
    // Verify with department_of_motor_traffic
    db.query(
      'SELECT * FROM department_of_motor_traffic WHERE registration_no = ? AND chassis_no = ? AND engine_no = ? AND owner_nic = (SELECT nic FROM user WHERE user_id = ?)',
      [registration_no, chassis_no, engine_no, user_id],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(400).json({ error: 'Vehicle details do not match DMT records' });

        const vehicle_type = results[0].vehicle_type;
        const qrData = JSON.stringify({ registration_no, chassis_no, user_id });
        try {
          const qr_code = await qrcode.toDataURL(qrData);
          db.query(
            'INSERT INTO vehicle (registration_no, chassis_no, engine_no, vehicle_type, qr_code, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [registration_no, chassis_no, engine_no, vehicle_type, qr_code, user_id],
            (err, result) => {
              if (err) return res.status(500).json({ error: err.message });
              res.status(201).json({ message: 'Vehicle registered', vehicle_id: result.insertId, qr_code });
            }
          );
        } catch (err) {
          res.status(500).json({ error: 'QR code generation failed' });
        }
      }
    );
  },

  getVehicle: (req, res) => {
    const { vehicle_id } = req.params;
    db.query('SELECT * FROM vehicle WHERE vehicle_id = ?', [vehicle_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
      res.json(results[0]);
    });
  }
};

module.exports = vehicleController;