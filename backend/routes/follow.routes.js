const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    toggleFollow,
    getMyFollowing,
    getMyFollowers
} = require("../controllers/follow.controller");

router.get("/following", verifyToken, getMyFollowing);
router.get("/followers", verifyToken, getMyFollowers);
router.post("/:user_id", verifyToken, toggleFollow);

module.exports = router;