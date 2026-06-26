const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    getMyNotifications,
    markAsRead,
    markAllAsRead
} = require("../controllers/notification.controller");

router.get("/", verifyToken, getMyNotifications);
router.put("/:id/read", verifyToken, markAsRead);
router.put("/read-all", verifyToken, markAllAsRead);

module.exports = router;