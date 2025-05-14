const db = require('../../config/db');

const fuelTransactionController = {
    createFuelTransaction: (req, res) => {
        const { vehicle_id, station_id, operator_user_id, pumped_litres } = req.body;
        // Check available quota
        db.query(
            'SELECT allocated_litres, used_litres FROM fuel_quota WHERE vehicle_id = ? AND quota_period = ?',
            [vehicle_id, new Date().toISOString().slice(0, 10)],
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                if (results.length === 0) return res.status(400).json({ error: 'No quota found for vehicle' });
                const { allocated_litres, used_litres } = results[0];
                if (pumped_litres > allocated_litres - used_litres) {
                    return res.status(400).json({ error: 'Insufficient fuel quota' });
                }
                // Record transaction
                db.query(
                    'INSERT INTO fuel_transaction (vehicle_id, station_id, operator_user_id, pumped_litres) VALUES (?, ?, ?, ?)',
                    [vehicle_id, station_id, operator_user_id, pumped_litres],
                    (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        // Update used_litres
                        db.query(
                            'UPDATE fuel_quota SET used_litres = used_litres + ? WHERE vehicle_id = ?',
                            [pumped_litres, vehicle_id],
                            (err) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.status(201).json({ message: 'Fuel transaction recorded' });
                            }
                        );
                    }
                );
            }
        );
    },

    getTransactions: (req, res) => {
        const { vehicle_id } = req.params;
        db.query('SELECT * FROM fuel_transaction WHERE vehicle_id = ?', [vehicle_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    }
};

module.exports = fuelTransactionController;