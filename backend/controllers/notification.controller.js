const { sql, poolPromise } = require("../config/db");

const getMyNotifications = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    notification_id,
                    user_id,
                    title,
                    content,
                    content AS message,
                    is_read,
                    created_at
                FROM Notifications
                WHERE user_id = @user_id
                ORDER BY created_at DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Get my notifications error:", error);
        res.status(500).json({
            message: "Lỗi lấy thông báo",
            error: error.message
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input("notification_id", sql.Int, id)
            .input("user_id", sql.Int, user_id)
            .query(`
                UPDATE Notifications
                SET is_read = 1
                WHERE notification_id = @notification_id
                  AND user_id = @user_id
            `);

        res.json({
            message: "Đã đọc thông báo"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi cập nhật thông báo",
            error: error.message
        });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const pool = await poolPromise;

        await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                UPDATE Notifications
                SET is_read = 1
                WHERE user_id = @user_id
            `);

        res.json({
            message: "Đã đọc tất cả thông báo"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi cập nhật thông báo",
            error: error.message
        });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead
};