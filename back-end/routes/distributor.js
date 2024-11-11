const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');

// Đảm bảo rằng bạn đang sử dụng một middleware hợp lệ
router.get("/distributor-home", distributorController.getInfoHomeDistributor);

module.exports = router;