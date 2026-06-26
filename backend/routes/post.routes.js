const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");

const {
    createPost,
    approvePost,
    rejectPost,
    getPosts,
    getAdminPosts,
    getAdminPostById,
    getPostById,
    uploadPostImages,
    markAsSold,
    updatePost,
    deletePost,
    updatePostImages
} = require("../controllers/post.controller");

router.post("/", verifyToken, createPost);
router.post("/:id/images",verifyToken,upload.array("images", 6), uploadPostImages);
router.put("/:id/approve", verifyToken, isAdmin, approvePost);
router.put("/:id/reject", verifyToken, isAdmin, rejectPost);
router.get("/", getPosts);
router.get("/admin/all", verifyToken, isAdmin, getAdminPosts);
router.get("/admin/:id", verifyToken, isAdmin, getAdminPostById);
router.get("/:id", getPostById);
router.put("/:id/mark-sold",verifyToken,markAsSold);
router.put("/:id",verifyToken,updatePost);
router.delete("/:id", verifyToken, deletePost);
router.put("/:id/images",verifyToken,upload.array("images", 6),updatePostImages);

module.exports = router;