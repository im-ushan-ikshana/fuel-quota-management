const express = require('express');
const router = express.Router();
const fuelStationController = require('../controllers/fuelStationController');

router.post('/', fuelStationController.createFuelStation);
router.get('/:station_id', fuelStationController.getFuelStation);

module.exports = router;