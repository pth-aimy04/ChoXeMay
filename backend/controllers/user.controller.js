const bcrypt = require("bcrypt");
const { sql, poolPromise } = require("../config/db");


const getMyPosts = async (req, res) => {
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
                    p.status,
                    p.is_sold,
                    p.reject_reason,
                    p.created_at,

                    b.brand_name,
                    m.model_name,

                    (
                        SELECT TOP 1 image_url
                        FROM PostImages
                        WHERE post_id = p.post_id
                        ORDER BY is_main DESC
                    ) AS thumbnail

                FROM Posts p
                JOIN Brands b ON p.brand_id = b.brand_id
                LEFT JOIN Models m ON p.model_id = m.model_id

                WHERE p.seller_id = @user_id

                ORDER BY p.created_at DESC
            `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi lấy danh sách tin đã đăng"
        });
    }
};



const addViewHistory = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { post_id } = req.params;

        const pool = await poolPromise;

        await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("post_id", sql.Int, post_id)
            .query(`
                IF EXISTS (
                    SELECT 1 
                    FROM ViewHistory
                    WHERE user_id = @user_id 
                      AND post_id = @post_id
                )
                BEGIN
                    UPDATE ViewHistory
                    SET viewed_at = GETDATE()
                    WHERE user_id = @user_id 
                      AND post_id = @post_id
                END
                ELSE
                BEGIN
                    INSERT INTO ViewHistory(user_id, post_id, viewed_at)
                    VALUES(@user_id, @post_id, GETDATE())
                END
            `);

        res.json({
            message: "Đã lưu lịch sử xem"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi lưu lịch sử xem"
        });
    }
};

const getViewHistory = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    vh.history_id,
                    vh.viewed_at,
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
                FROM ViewHistory vh
                JOIN Posts p ON vh.post_id = p.post_id
                JOIN Brands b ON p.brand_id = b.brand_id
                LEFT JOIN Models m ON p.model_id = m.model_id
                WHERE vh.user_id = @user_id
                ORDER BY vh.viewed_at DESC
            `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi lấy lịch sử xem"
        });
    }
};


const getUserPublicProfile = async (req, res) => {
    try {
        const user_id = parseInt(req.params.id);
        const pool = await poolPromise;

        const userResult = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    u.user_id,
                    u.full_name,
                    u.phone,
                    u.avatar_url,
                    u.bio,
                    u.is_verified,
                    u.created_at
                FROM Users u
                WHERE u.user_id = @user_id
                  AND u.status = 'active'
            `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            });
        }

        const statsResult = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    (SELECT COUNT(*) FROM Follows WHERE following_id = @user_id) AS total_followers,
                    (SELECT COUNT(*) FROM Follows WHERE follower_id = @user_id) AS total_following,
                    (SELECT COUNT(*) FROM Posts WHERE seller_id = @user_id) AS total_posts,
                    (SELECT COUNT(*) FROM Posts WHERE seller_id = @user_id AND is_sold = 1) AS total_sold,
                    (SELECT COUNT(*) FROM Reviews WHERE seller_id = @user_id) AS total_reviews,
                    (SELECT ISNULL(AVG(CAST(rating AS FLOAT)), 0) FROM Reviews WHERE seller_id = @user_id) AS avg_rating
            `);

        const sellingPosts = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    p.post_id,
                    p.title,
                    p.price,
                    p.manufacture_year,
                    p.mileage,
                    p.created_at,
                    b.brand_name,
                    m.model_name,
                    w.ward_name,
                    (
                        SELECT TOP 1 image_url
                        FROM PostImages
                        WHERE post_id = p.post_id
                        ORDER BY is_main DESC
                    ) AS thumbnail
                FROM Posts p
                JOIN Brands b ON p.brand_id = b.brand_id
                LEFT JOIN Models m ON p.model_id = m.model_id
                JOIN Wards w ON p.ward_id = w.ward_id
                WHERE p.seller_id = @user_id
                  AND p.status = 'approved'
                  AND p.is_sold = 0
                ORDER BY p.created_at DESC
            `);

        const soldPosts = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT
                    p.post_id,
                    p.title,
                    p.price,
                    p.manufacture_year,
                    p.mileage,
                    p.created_at,
                    b.brand_name,
                    m.model_name,
                    w.ward_name,
                    (
                        SELECT TOP 1 image_url
                        FROM PostImages
                        WHERE post_id = p.post_id
                        ORDER BY is_main DESC
                    ) AS thumbnail
                FROM Posts p
                JOIN Brands b ON p.brand_id = b.brand_id
                LEFT JOIN Models m ON p.model_id = m.model_id
                JOIN Wards w ON p.ward_id = w.ward_id
                WHERE p.seller_id = @user_id
                  AND p.status = 'approved'
                  AND p.is_sold = 1
                ORDER BY p.updated_at DESC
            `);

        return res.json({
            user: userResult.recordset[0],
            stats: statsResult.recordset[0],
            selling_posts: sellingPosts.recordset,
            sold_posts: soldPosts.recordset
        });

    } catch (error) {
        console.error("Public profile error:", error);
        return res.status(500).json({
            message: "Lỗi lấy hồ sơ người dùng",
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                u.status,
                u.created_at,
                r.role_name
            FROM Users u
            LEFT JOIN Roles r ON u.role_id = r.role_id
            ORDER BY u.created_at DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi lấy danh sách người dùng"
        });
    }
};

const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input("user_id", sql.Int, id)
            .query(`
                UPDATE Users
                SET status = 'blocked'
                WHERE user_id = @user_id
            `);

        res.json({ message: "Khóa tài khoản thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi khóa tài khoản"
        });
    }
};

const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input("user_id", sql.Int, id)
            .query(`
                UPDATE Users
                SET status = 'active'
                WHERE user_id = @user_id
            `);

        res.json({ message: "Mở khóa tài khoản thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi mở khóa tài khoản"
        });
    }
};


const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id } = req.body;

        const pool = await poolPromise;

        await pool.request()
            .input("user_id", sql.Int, id)
            .input("role_id", sql.Int, role_id)
            .query(`
                UPDATE Users
                SET role_id = @role_id
                WHERE user_id = @user_id
            `);

        return res.json({
            message: "Cập nhật vai trò thành công"
        });
    } catch (error) {
        console.error("Update user role error:", error);
        return res.status(500).json({
            message: "Lỗi cập nhật vai trò"
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu mới không khớp" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải từ 6 ký tự" });
        }

        const pool = await poolPromise;

        const userResult = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT password_hash
                FROM Users
                WHERE user_id = @user_id
            `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const user = userResult.recordset[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("password_hash", sql.NVarChar, hashedPassword)
            .query(`
                UPDATE Users
                SET password_hash = @password_hash
                WHERE user_id = @user_id
            `);

        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi đổi mật khẩu" });
    }
};


const updateMyProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { full_name, email, phone, bio } = req.body;

        if (!full_name || !email || !phone) {
            return res.status(400).json({
                message: "Vui lòng nhập họ tên, email và số điện thoại"
            });
        }

        const avatar_url = req.file ? `/uploads/${req.file.filename}` : null;

        const pool = await poolPromise;

        const checkDuplicate = await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("email", sql.VarChar, email)
            .input("phone", sql.VarChar, phone)
            .query(`
                SELECT user_id
                FROM Users
                WHERE (email = @email OR phone = @phone)
                  AND user_id <> @user_id
            `);

        if (checkDuplicate.recordset.length > 0) {
            return res.status(400).json({
                message: "Email hoặc số điện thoại đã tồn tại"
            });
        }

        await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("full_name", sql.NVarChar, full_name)
            .input("email", sql.VarChar, email)
            .input("phone", sql.VarChar, phone)
            .input("bio", sql.NVarChar, bio || "")
            .input("avatar_url", sql.NVarChar, avatar_url)
            .query(`
                UPDATE Users
                SET 
                    full_name = @full_name,
                    email = @email,
                    phone = @phone,
                    bio = @bio,
                    avatar_url = ISNULL(@avatar_url, avatar_url)
                WHERE user_id = @user_id
            `);

        const updatedUser = await pool.request()
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT 
                    u.user_id,
                    u.full_name,
                    u.email,
                    u.phone,
                    u.avatar_url,
                    u.bio,
                    r.role_name AS role
                FROM Users u
                LEFT JOIN Roles r ON u.role_id = r.role_id
                WHERE u.user_id = @user_id
            `);

        res.json({
            message: "Cập nhật hồ sơ thành công",
            user: updatedUser.recordset[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi cập nhật hồ sơ" });
    }
};

module.exports = {
    getMyPosts,
    addViewHistory,
    getViewHistory,
    getUserPublicProfile,
    getAllUsers,
    blockUser,
    unblockUser,
    updateUserRole,
    changePassword,
   
updateMyProfile
};