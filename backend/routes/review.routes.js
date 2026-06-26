const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    addReview,
    getSellerReviews,
    getSellerReviewSummary
} = require("../controllers/review.controller");

router.post("/:seller_id", verifyToken, addReview);
router.get("/:seller_id", getSellerReviews);
router.get("/:seller_id/summary", getSellerReviewSummary);

module.exports = router;