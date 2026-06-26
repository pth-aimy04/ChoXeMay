const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");

const {
    getMyPosts,
    addViewHistory,
    getViewHistory,
    getUserPublicProfile,
    getAllUsers,
    blockUser,
    unblockUser,
    updateUserRole,
    updateMyProfile,
    changePassword
} = require("../controllers/user.controller");

router.put("/change-password", verifyToken, changePassword);
router.get("/my-posts", verifyToken, getMyPosts);
router.post("/view-history/:post_id", verifyToken, addViewHistory);
router.get("/view-history", verifyToken, getViewHistory);

router.get("/admin/all", verifyToken, isAdmin, getAllUsers);
router.put("/admin/:id/block", verifyToken, isAdmin, blockUser);
router.put("/admin/:id/unblock", verifyToken, isAdmin, unblockUser);

router.get("/:id/profile", getUserPublicProfile);

router.put("/admin/:id/role", verifyToken, isAdmin, updateUserRole);


router.put("/me/profile",verifyToken,upload.single("avatar"),updateMyProfile);


module.exports = router;