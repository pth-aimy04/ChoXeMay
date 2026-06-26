const { sql, poolPromise } = require("../config/db");

const addComment = async (req, res) => {
    try {
        const user_id = parseInt(req.user.user_id);
        const post_id = parseInt(req.params.post_id);
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Nội dung bình luận không được để trống"
            });
        }

        const pool = await poolPromise;

        await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("post_id", sql.Int, post_id)
            .input("content", sql.NVarChar, content)
            .query(`
                INSERT INTO Comments(user_id, post_id, content)
                VALUES(@user_id, @post_id, @content)
            `);

        return res.status(201).json({
            message: "Bình luận thành công"
        });

    } catch (error) {
        console.error("Comment error:", error);
        return res.status(500).json({
            message: "Lỗi bình luận",
            error: error.message
        });
    }
};

const getCommentsByPost = async (req, res) => {
    try {
        const post_id = parseInt(req.params.post_id);

        const pool = await poolPromise;

        const result = await pool.request()
            .input("post_id", sql.Int, post_id)
            .query(`
                SELECT
                    c.comment_id,
                    c.content,
                    c.created_at,
                    u.user_id,
                    u.full_name,
                    u.avatar_url
                FROM Comments c
                JOIN Users u ON c.user_id = u.user_id
                WHERE c.post_id = @post_id
                  AND c.status = 'active'
                ORDER BY c.created_at DESC
            `);

        return res.json(result.recordset);

    } catch (error) {
        console.error("Get comments error:", error);
        return res.status(500).json({
            message: "Lỗi lấy bình luận",
            error: error.message
        });
    }
};

const hideComment = async (req, res) => {
    try {
        const comment_id = parseInt(req.params.comment_id);

        const pool = await poolPromise;

        await pool.request()
            .input("comment_id", sql.Int, comment_id)
            .query(`
                UPDATE Comments
                SET status = 'hidden',
                    updated_at = GETDATE()
                WHERE comment_id = @comment_id
            `);

        return res.json({
            message: "Ẩn bình luận thành công"
        });

    } catch (error) {
        console.error("Hide comment error:", error);
        return res.status(500).json({
            message: "Lỗi ẩn bình luận",
            error: error.message
        });
    }
};


const deleteMyComment = async (req, res) => {
    try {
        const user_id = parseInt(req.user.user_id);
        const comment_id = parseInt(req.params.comment_id);

        const pool = await poolPromise;

        const result = await pool.request()
            .input("comment_id", sql.Int, comment_id)
            .input("user_id", sql.Int, user_id)
            .query(`
                DELETE FROM Comments
                WHERE comment_id = @comment_id
                  AND user_id = @user_id
            `);

        return res.json({
            message: "Xóa bình luận thành công"
        });

    } catch (error) {
        console.error("Delete comment error:", error);
        return res.status(500).json({
            message: "Lỗi xóa bình luận",
            error: error.message
        });
    }
};

module.exports = {
    addComment,
    getCommentsByPost,
    hideComment,
    deleteMyComment
};