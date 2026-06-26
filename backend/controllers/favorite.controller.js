const { sql, poolPromise } = require("../config/db");

const toggleFavorite = async (req, res) => {
    try {

        const user_id = parseInt(req.user.user_id);
const post_id = parseInt(req.params.post_id);

if (!post_id) {
    return res.status(400).json({
        message: "post_id không hợp lệ"
    });
}

        const pool = await poolPromise;

        const check = await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("post_id", sql.Int, post_id)
            .query(`
                SELECT *
                FROM Favorites
                WHERE user_id = @user_id
                  AND post_id = @post_id
            `);
            console.log("USER:", user_id, "POST:", post_id);
            console.log("CHECK:", check.recordset.length);

        if (check.recordset.length > 0) {

            await pool.request()
                .input("user_id", sql.Int, user_id)
                .input("post_id", sql.Int, post_id)
                .query(`
                    DELETE FROM Favorites
                    WHERE user_id = @user_id
                      AND post_id = @post_id
                `);

            return res.json({
                message: "Đã bỏ yêu thích"
            });
        }

        await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("post_id", sql.Int, post_id)
            .query(`
                INSERT INTO Favorites(user_id, post_id)
                VALUES(@user_id, @post_id)
            `);

        res.json({
            message: "Đã thêm vào yêu thích"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Lỗi yêu thích"
        });

    }
};

const getMyFavorites = async (req, res) => {
    try {

        const user_id = req.user.user_id;

        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    p.post_id,
                    p.title,
                    p.price,

                    b.brand_name,
                    m.model_name,

                    (
                        SELECT TOP 1 image_url
                        FROM PostImages
                        WHERE post_id = p.post_id
                        ORDER BY is_main DESC
                    ) AS thumbnail

                FROM Favorites f

                JOIN Posts p
                    ON f.post_id = p.post_id

                JOIN Brands b
                    ON p.brand_id = b.brand_id

                LEFT JOIN Models m
                    ON p.model_id = m.model_id

                WHERE f.user_id = @user_id

                ORDER BY f.created_at DESC
            `);

        res.json(result.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Lỗi lấy danh sách yêu thích"
        });

    }
};

const checkFavorite = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { post_id } = req.params;

        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("post_id", sql.Int, post_id)
            .query(`
                SELECT COUNT(*) AS total
                FROM Favorites
                WHERE user_id = @user_id
                  AND post_id = @post_id
            `);

        res.json({
            is_favorite: result.recordset[0].total > 0
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi kiểm tra yêu thích",
            error: error.message
        });
    }
};


module.exports = {
    toggleFavorite,
    getMyFavorites,
    checkFavorite
};