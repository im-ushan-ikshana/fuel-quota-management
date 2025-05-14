const db = require('../../config/db');

const roleController = {
    createRole: (req, res) => {
        const { role_name } = req.body;
        db.query('INSERT INTO role (role_name) VALUES (?)', [role_name], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Role created', role_id: result.insertId });
        });
    },

    assignRole: (req, res) => {
        const { user_id, role_id } = req.body;
        db.query('INSERT INTO user_role (user_id, role_id) VALUES (?, ?)', [user_id, role_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Role assigned' });
        });
    },

    getRoles: (req, res) => {
        db.query('SELECT * FROM role', (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    }
};

module.exports = roleController;