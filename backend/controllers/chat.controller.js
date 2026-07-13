const { sql, poolPromise } = require("../config/db");

const startConversation = async (req, res) => {
    try {
        const buyer_id = req.user.user_id;
        const { post_id } = req.body;

        console.log("START CHAT BODY:", req.body);
        console.log("BUYER:", buyer_id);

        if (!post_id) {
            return res.status(400).json({
                message: "Thiếu mã bài đăng"
            });
        }

        const pool = await poolPromise;

        const postResult = await pool.request()
            .input("post_id", sql.Int, post_id)
            .query(`
                SELECT post_id, seller_id
                FROM Posts
                WHERE post_id = @post_id
            `);

        if (postResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy bài đăng"
            });
        }

        const seller_id = postResult.recordset[0].seller_id;

        if (Number(buyer_id) === Number(seller_id)) {
            return res.status(400).json({
                message: "Bạn không thể nhắn tin với chính mình"
            });
        }

        const check = await pool.request()
            .input("post_id", sql.Int, post_id)
            .input("buyer_id", sql.Int, buyer_id)
            .input("seller_id", sql.Int, seller_id)
            .query(`
                SELECT conversation_id
                FROM Conversations
                WHERE post_id = @post_id
                  AND buyer_id = @buyer_id
                  AND seller_id = @seller_id
            `);

        if (check.recordset.length > 0) {
            return res.json(check.recordset[0]);
        }

        const result = await pool.request()
            .input("post_id", sql.Int, post_id)
            .input("buyer_id", sql.Int, buyer_id)
            .input("seller_id", sql.Int, seller_id)
            .query(`
                INSERT INTO Conversations (post_id, buyer_id, seller_id, created_at)
                OUTPUT INSERTED.conversation_id
                VALUES (@post_id, @buyer_id, @seller_id, GETDATE())
            `);

        return res.status(201).json(result.recordset[0]);

    } catch (error) {
        console.error("Start conversation error:", error);
        return res.status(500).json({
            message: "Lỗi tạo cuộc trò chuyện",
            error: error.message
        });
    }
};

const getMyConversations = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    c.conversation_id,
                    c.post_id,
                    c.buyer_id,
                    c.seller_id,
                    c.updated_at,

                    p.title AS post_title,
                    p.price,

                    CASE
                        WHEN c.buyer_id = @user_id THEN seller.full_name
                        ELSE buyer.full_name
                    END AS other_user_name,

                    CASE
                        WHEN c.buyer_id = @user_id THEN seller.avatar_url
                        ELSE buyer.avatar_url
                    END AS other_user_avatar,

                    (
                        SELECT TOP 1 image_url
                        FROM PostImages
                        WHERE post_id = p.post_id
                        ORDER BY is_main DESC, image_id ASC
                    ) AS post_image,

                    (
                        SELECT TOP 1 message_content
                        FROM Messages
                        WHERE conversation_id = c.conversation_id
                        ORDER BY created_at DESC
                    ) AS last_message,

                    (
                        SELECT TOP 1 created_at
                        FROM Messages
                        WHERE conversation_id = c.conversation_id
                        ORDER BY created_at DESC
                    ) AS last_message_time,

                    (
                        SELECT COUNT(*)
                        FROM Messages
                        WHERE conversation_id = c.conversation_id
                          AND sender_id <> @user_id
                          AND is_read = 0
                    ) AS unread_count

                FROM Conversations c
                JOIN Posts p ON c.post_id = p.post_id
                JOIN Users buyer ON c.buyer_id = buyer.user_id
                JOIN Users seller ON c.seller_id = seller.user_id
                WHERE c.buyer_id = @user_id OR c.seller_id = @user_id
                ORDER BY 
                    ISNULL((
                        SELECT TOP 1 created_at
                        FROM Messages
                        WHERE conversation_id = c.conversation_id
                        ORDER BY created_at DESC
                    ), c.created_at) DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({
            message: "Lỗi lấy danh sách tin nhắn"
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { conversation_id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("conversation_id", sql.Int, conversation_id)
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    m.message_id,
                    m.conversation_id,
                    m.sender_id,
                    m.message_content,
                    m.is_read,
                    m.created_at,
                    u.full_name,
                    u.avatar_url
                FROM Messages m
                JOIN Users u ON m.sender_id = u.user_id
                JOIN Conversations c ON m.conversation_id = c.conversation_id
                WHERE m.conversation_id = @conversation_id
                  AND (c.buyer_id = @user_id OR c.seller_id = @user_id)
                ORDER BY m.created_at ASC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({
            message: "Lỗi lấy tin nhắn"
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const sender_id = req.user.user_id;
        const { conversation_id } = req.params;
        const { message_content } = req.body;

        if (!message_content || !message_content.trim()) {
            return res.status(400).json({
                message: "Vui lòng nhập nội dung tin nhắn"
            });
        }

        const pool = await poolPromise;

        const checkConversation = await pool.request()
            .input("conversation_id", sql.Int, conversation_id)
            .input("sender_id", sql.Int, sender_id)
            .query(`
                SELECT conversation_id
                FROM Conversations
                WHERE conversation_id = @conversation_id
                  AND (buyer_id = @sender_id OR seller_id = @sender_id)
            `);

        if (checkConversation.recordset.length === 0) {
            return res.status(403).json({
                message: "Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này"
            });
        }

        const result = await pool.request()
            .input("conversation_id", sql.Int, conversation_id)
            .input("sender_id", sql.Int, sender_id)
            .input("message_content", sql.NVarChar, message_content)
            .query(`
                INSERT INTO Messages(conversation_id, sender_id, message_content, is_read, created_at)
                OUTPUT INSERTED.*
                VALUES(@conversation_id, @sender_id, @message_content, 0, GETDATE());

                UPDATE Conversations
                SET updated_at = GETDATE()
                WHERE conversation_id = @conversation_id;
            `);

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({
            message: "Lỗi gửi tin nhắn"
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { conversation_id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input("conversation_id", sql.Int, conversation_id)
            .input("user_id", sql.Int, user_id)
            .query(`
                UPDATE Messages
                SET is_read = 1
                WHERE conversation_id = @conversation_id
                  AND sender_id <> @user_id
            `);

        res.json({
            message: "Đã đánh dấu đã đọc"
        });
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({
            message: "Lỗi cập nhật trạng thái tin nhắn"
        });
    }
};


const getUnreadMessageCount = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT COUNT(*) AS unread_count
                FROM Messages m
                JOIN Conversations c 
                    ON m.conversation_id = c.conversation_id
                WHERE m.is_read = 0
                  AND m.sender_id <> @user_id
                  AND (c.buyer_id = @user_id OR c.seller_id = @user_id)
            `);

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Unread message count error:", error);
        res.status(500).json({
            message: "Lỗi lấy số tin nhắn chưa đọc"
        });
    }
};



module.exports = {
    startConversation,
    getMyConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadMessageCount
};