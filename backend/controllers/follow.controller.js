const { sql, poolPromise } = require("../config/db");

const toggleFollow = async (req, res) => {
    try {
        const follower_id = parseInt(req.user.user_id);
        const following_id = parseInt(req.params.user_id);

        if (!following_id) {
            return res.status(400).json({
                message: "Người dùng không hợp lệ"
            });
        }

        if (follower_id === following_id) {
            return res.status(400).json({
                message: "Bạn không thể tự theo dõi chính mình"
            });
        }

        const pool = await poolPromise;

        const check = await pool.request()
            .input("follower_id", sql.Int, follower_id)
            .input("following_id", sql.Int, following_id)
            .query(`
                SELECT *
                FROM Follows
                WHERE follower_id = @follower_id
                  AND following_id = @following_id
            `);

        console.log("FOLLOWER:", follower_id, "FOLLOWING:", following_id);
        console.log("CHECK FOLLOW:", check.recordset.length);

        if (check.recordset.length > 0) {
            await pool.request()
                .input("follower_id", sql.Int, follower_id)
                .input("following_id", sql.Int, following_id)
                .query(`
                    DELETE FROM Follows
                    WHERE follower_id = @follower_id
                      AND following_id = @following_id
                `);

            return res.json({
                message: "Đã bỏ theo dõi"
            });
        }

        await pool.request()
            .input("follower_id", sql.Int, follower_id)
            .input("following_id", sql.Int, following_id)
            .query(`
                INSERT INTO Follows(follower_id, following_id)
                VALUES(@follower_id, @following_id)
            `);

        return res.json({
            message: "Đã theo dõi người bán"
        });

    } catch (error) {
        console.error("Follow error:", error);

        return res.status(500).json({
            message: "Lỗi theo dõi người bán",
            error: error.message
        });
    }
};

const getMyFollowing = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    u.user_id,
                    u.full_name,
                    u.avatar_url,
                    u.bio,
                    f.created_at AS followed_at
                FROM Follows f
                JOIN Users u ON f.following_id = u.user_id
                WHERE f.follower_id = @user_id
                ORDER BY f.created_at DESC
            `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi lấy danh sách đang theo dõi"
        });
    }
};

const getMyFollowers = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    u.user_id,
                    u.full_name,
                    u.avatar_url,
                    u.bio,
                    f.created_at AS followed_at
                FROM Follows f
                JOIN Users u ON f.follower_id = u.user_id
                WHERE f.following_id = @user_id
                ORDER BY f.created_at DESC
            `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi lấy danh sách người theo dõi"
        });
    }
};

module.exports = {
    toggleFollow,
    getMyFollowing,
    getMyFollowers
};