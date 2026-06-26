const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    toggleFavorite,
    getMyFavorites,
    checkFavorite
} = require("../controllers/favorite.controller");

router.get("/my-favorites", verifyToken, getMyFavorites);
router.get("/check/:post_id", verifyToken, checkFavorite);
router.post("/:post_id", verifyToken, toggleFavorite);

module.exports = router;