const express = require("express");
const router = express.Router();
const statisticController = require("../controllers/statisticController");

router.get("/farmer/statistic/:farmId", statisticController.getStatistics);
