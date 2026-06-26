const { sql, poolPromise } = require("../config/db");

const addReview = async (req, res) => {
    try {
        const reviewer_id = parseInt(req.user.user_id);
        const seller_id = parseInt(req.params.seller_id);
        const { post_id, rating, comment } = req.body;

        if (reviewer_id === seller_id) {
            return res.status(400).json({
                message: "Bạn không thể tự đánh giá chính mình"
            });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Số sao phải từ 1 đến 5"
            });
        }

        const pool = await poolPromise;

        await pool.request()
            .input("reviewer_id", sql.Int, reviewer_id)
            .input("seller_id", sql.Int, seller_id)
            .input("post_id", sql.Int, post_id || null)
            .input("rating", sql.Int, rating)
            .input("comment", sql.NVarChar, comment || null)
            .query(`
                INSERT INTO Reviews(reviewer_id, seller_id, post_id, rating, comment)
                VALUES(@reviewer_id, @seller_id, @post_id, @rating, @comment)
            `);

        res.status(201).json({
            message: "Đánh giá người bán thành công"
        });

    } catch (error) {
        console.error("Review error:", error);
        res.status(500).json({
            message: "Lỗi đánh giá người bán",
            error: error.message
        });
    }
};

const getSellerReviews = async (req, res) => {
    try {
        const seller_id = parseInt(req.params.seller_id);
        const pool = await poolPromise;

        const result = await pool.request()
            .input("seller_id", sql.Int, seller_id)
            .query(`
                SELECT
                    r.review_id,
                    r.rating,
                    r.comment,
                    r.created_at,

                    u.user_id AS reviewer_id,
                    u.full_name AS reviewer_name,
                    u.avatar_url AS reviewer_avatar,

                    p.post_id,
                    p.title AS post_title

                FROM Reviews r
                JOIN Users u ON r.reviewer_id = u.user_id
                LEFT JOIN Posts p ON r.post_id = p.post_id

                WHERE r.seller_id = @seller_id

                ORDER BY r.created_at DESC
            `);

        res.json(result.recordset);

    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({
            message: "Lỗi lấy đánh giá người bán",
            error: error.message
        });
    }
};

const getSellerReviewSummary = async (req, res) => {
    try {
        const seller_id = parseInt(req.params.seller_id);
        const pool = await poolPromise;

        const result = await pool.request()
            .input("seller_id", sql.Int, seller_id)
            .query(`
                SELECT
                    COUNT(*) AS total_reviews,
                    ISNULL(AVG(CAST(rating AS FLOAT)), 0) AS avg_rating
                FROM Reviews
                WHERE seller_id = @seller_id
            `);

        res.json(result.recordset[0]);

    } catch (error) {
        console.error("Review summary error:", error);
        res.status(500).json({
            message: "Lỗi lấy thống kê đánh giá",
            error: error.message
        });
    }
};

module.exports = {
    addReview,
    getSellerReviews,
    getSellerReviewSummary
};