const express = require('express');
const router = express.Router();
const fuelQuotaController = require('../controllers/fuelQuotaController');

router.post('/', fuelQuotaController.createFuelQuota);
router.get('/:vehicle_id', fuelQuotaController.getFuelQuota);
router.put('/reset', fuelQuotaController.resetQuotas);

module.exports = router;