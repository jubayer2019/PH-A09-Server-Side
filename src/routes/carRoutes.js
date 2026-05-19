const express = require('express');
const carController = require('../controllers/carController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate, carSchema, carUpdateSchema } = require('../middleware/validate');

const router = express.Router();

router.get('/', carController.getCars);
router.get('/my-cars', requireAuth, carController.getMyCars);
router.get('/:id', carController.getCarById);
router.post('/', requireAuth, validate(carSchema), carController.createCar);
router.patch('/:id', requireAuth, validate(carUpdateSchema), carController.updateCar);
router.delete('/:id', requireAuth, carController.deleteCar);

module.exports = router;
