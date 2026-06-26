const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getProfile,
    logout,
    forgotPassword,
    resetPassword
} = require("../controllers/auth.controller");

const verifyToken = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.post("/logout", verifyToken, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;