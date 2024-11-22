const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.post("/review", reviewController.addReview);
router.get("/review/:productId", reviewController.getAllReviewByProductId);
router.get("/review/rating/:productId", reviewController.getAmountOfReview);

module.exports = router;
