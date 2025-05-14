const db = require('../../config/db');
const bcrypt = require('bcrypt');

const userController = {
    registerUser: async (req, res) => {
        const { full_name, nic, email, phone_number, password } = req.body;
        try {
            const password_hash = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO user (full_name, nic, email, phone_number, password_hash) VALUES (?, ?, ?, ?, ?)';
            db.query(query, [full_name, nic, email, phone_number, password_hash], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'User registered', user_id: result.insertId });
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getUser: (req, res) => {
        const { user_id } = req.params;
        db.query('SELECT * FROM user WHERE user_id = ?', [user_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: 'User not found' });
            res.json(results[0]);
        });
    },

    updateUser: (req, res) => {
        const { user_id } = req.params;
        const { full_name, email, phone_number } = req.body;
        db.query(
            'UPDATE user SET full_name = ?, email = ?, phone_number = ? WHERE user_id = ?',
            [full_name, email, phone_number, user_id],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'User updated' });
            }
        );
    },

    deleteUser: (req, res) => {
        const { user_id } = req.params;
        db.query('DELETE FROM user WHERE user_id = ?', [user_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User deleted' });
        });
    }
};

module.exports = userController;