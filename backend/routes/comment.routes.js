const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

const {
    addComment,
    getCommentsByPost,
    hideComment,
    deleteMyComment
} = require("../controllers/comment.controller");

router.get("/post/:post_id", getCommentsByPost);
router.post("/post/:post_id", verifyToken, addComment);
router.put("/:comment_id/hide", verifyToken, isAdmin, hideComment);
router.delete("/:comment_id", verifyToken, deleteMyComment);

module.exports = router;