const db = require('../../config/db');

const fuelStationController = {
    createFuelStation: (req, res) => {
        const { station_name, station_license, address, district, owner_user_id } = req.body;
        db.query(
            'INSERT INTO fuel_station (station_name, station_license, address, district, owner_user_id) VALUES (?, ?, ?, ?, ?)',
            [station_name, station_license, address, district, owner_user_id],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'Fuel station created', station_id: result.insertId });
            }
        );
    },

    getFuelStation: (req, res) => {
        const { station_id } = req.params;
        db.query('SELECT * FROM fuel_station WHERE station_id = ?', [station_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: 'Fuel station not found' });
            res.json(results[0]);
        });
    }
};

module.exports = fuelStationController;