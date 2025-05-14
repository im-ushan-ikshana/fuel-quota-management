const express = require('express');
const router = express.Router();
const fuelTransactionController = require('../controllers/fuelTransactionController');

router.post('/', fuelTransactionController.createFuelTransaction);
router.get('/:vehicle_id', fuelTransactionController.getTransactions);

module.exports = router;