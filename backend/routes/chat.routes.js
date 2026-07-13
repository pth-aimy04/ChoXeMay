const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
    startConversation,
    getMyConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadMessageCount
    
} = require("../controllers/chat.controller");

router.post("/start", verifyToken, startConversation);
router.get("/conversations", verifyToken, getMyConversations);
router.get("/unread-count", verifyToken, getUnreadMessageCount);
router.get("/:conversation_id/messages", verifyToken, getMessages);
router.post("/:conversation_id/messages", verifyToken, sendMessage);
router.put("/:conversation_id/read", verifyToken, markAsRead);

module.exports = router;