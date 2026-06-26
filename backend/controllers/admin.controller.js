const {sql, poolPromise } = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {

        const pool = await poolPromise;

        const result = await pool.request()
            .query(`
                SELECT
                    (SELECT COUNT(*) FROM Users) AS total_users,

                    (SELECT COUNT(*) FROM Posts) AS total_posts,

                    (SELECT COUNT(*) FROM Posts
                     WHERE status='pending') AS pending_posts,

                    (SELECT COUNT(*) FROM Posts
                     WHERE status='approved') AS approved_posts,

                    (SELECT COUNT(*) FROM Favorites) AS total_favorites,

                    (SELECT COUNT(*) FROM Follows) AS total_follows,

                    (SELECT COUNT(*) FROM Comments) AS total_comments,

                    (SELECT COUNT(*) FROM Reviews) AS total_reviews
            `);

        return res.json(result.recordset[0]);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Lỗi dashboard"
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
                u.is_verified,
                u.created_at,
                r.role_name
            FROM Users u
            JOIN Roles r ON u.role_id = r.role_id
            ORDER BY u.created_at DESC
        `);

        res.json(result.recordset);

    } catch (error) {
        res.status(500).json({
            message: "Lỗi lấy danh sách người dùng",
            error: error.message
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
                SET status = 'blocked',
                    updated_at = GETDATE()
                WHERE user_id = @user_id
                  AND role_id <> 1
            `);

        res.json({
            message: "Khóa tài khoản thành công"
        });

    } catch (error) {
        res.status(500).json({
            message: "Lỗi khóa tài khoản",
            error: error.message
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
                SET status = 'active',
                    updated_at = GETDATE()
                WHERE user_id = @user_id
            `);

        res.json({
            message: "Mở khóa tài khoản thành công"
        });

    } catch (error) {
        res.status(500).json({
            message: "Lỗi mở khóa tài khoản",
            error: error.message
        });
    }
};



const getAllBrands = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT * FROM Brands ORDER BY brand_name ASC
        `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy hãng xe", error: error.message });
    }
};

const createBrand = async (req, res) => {
    try {
        const { brand_name } = req.body;

        if (!brand_name) {
            return res.status(400).json({ message: "Vui lòng nhập tên hãng xe" });
        }

        const pool = await poolPromise;
        await pool.request()
            .input("brand_name", sql.NVarChar, brand_name)
            .query(`INSERT INTO Brands(brand_name) VALUES(@brand_name)`);

        res.status(201).json({ message: "Thêm hãng xe thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm hãng xe", error: error.message });
    }
};

const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { brand_name } = req.body;

        const pool = await poolPromise;
        await pool.request()
            .input("brand_id", sql.Int, id)
            .input("brand_name", sql.NVarChar, brand_name)
            .query(`
                UPDATE Brands
                SET brand_name = @brand_name
                WHERE brand_id = @brand_id
            `);

        res.json({ message: "Cập nhật hãng xe thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật hãng xe", error: error.message });
    }
};

const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;
        await pool.request()
            .input("brand_id", sql.Int, id)
            .query(`DELETE FROM Brands WHERE brand_id = @brand_id`);

        res.json({ message: "Xóa hãng xe thành công" });
    } catch (error) {
        res.status(500).json({
            message: "Không thể xóa hãng xe vì đang có dòng xe hoặc bài đăng sử dụng",
            error: error.message
        });
    }
};


const getAllModels = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                m.model_id,
                m.model_name,
                m.brand_id,
                b.brand_name
            FROM Models m
            JOIN Brands b ON m.brand_id = b.brand_id
            ORDER BY b.brand_name ASC, m.model_name ASC
        `);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dòng xe", error: error.message });
    }
};

const createModel = async (req, res) => {
    try {
        const { brand_id, model_name } = req.body;

        if (!brand_id || !model_name) {
            return res.status(400).json({ message: "Vui lòng nhập hãng xe và dòng xe" });
        }

        const pool = await poolPromise;
        await pool.request()
            .input("brand_id", sql.Int, brand_id)
            .input("model_name", sql.NVarChar, model_name)
            .query(`
                INSERT INTO Models(brand_id, model_name)
                VALUES(@brand_id, @model_name)
            `);

        res.status(201).json({ message: "Thêm dòng xe thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm dòng xe", error: error.message });
    }
};

const updateModel = async (req, res) => {
    try {
        const { id } = req.params;
        const { brand_id, model_name } = req.body;

        const pool = await poolPromise;
        await pool.request()
            .input("model_id", sql.Int, id)
            .input("brand_id", sql.Int, brand_id)
            .input("model_name", sql.NVarChar, model_name)
            .query(`
                UPDATE Models
                SET brand_id = @brand_id,
                    model_name = @model_name
                WHERE model_id = @model_id
            `);

        res.json({ message: "Cập nhật dòng xe thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật dòng xe", error: error.message });
    }
};

const deleteModel = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;
        await pool.request()
            .input("model_id", sql.Int, id)
            .query(`DELETE FROM Models WHERE model_id = @model_id`);

        res.json({ message: "Xóa dòng xe thành công" });
    } catch (error) {
        res.status(500).json({
            message: "Không thể xóa dòng xe vì đang có bài đăng sử dụng",
            error: error.message
        });
    }
};


const getAllVehicleTypes = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT * FROM VehicleTypes ORDER BY type_name ASC
        `);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy loại xe", error: error.message });
    }
};

const createVehicleType = async (req, res) => {
    try {
        const { type_name } = req.body;

        if (!type_name) {
            return res.status(400).json({ message: "Vui lòng nhập tên loại xe" });
        }

        const pool = await poolPromise;
        await pool.request()
            .input("type_name", sql.NVarChar, type_name)
            .query(`
                INSERT INTO VehicleTypes(type_name)
                VALUES(@type_name)
            `);

        res.status(201).json({ message: "Thêm loại xe thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm loại xe", error: error.message });
    }
};

const updateVehicleType = async (req, res) => {
    try {
        const { id } = req.params;
        const { type_name } = req.body;

        const pool = await poolPromise;
        await pool.request()
            .input("type_id", sql.Int, id)
            .input("type_name", sql.NVarChar, type_name)
            .query(`
                UPDATE VehicleTypes
                SET type_name = @type_name
                WHERE type_id = @type_id
            `);

        res.json({ message: "Cập nhật loại xe thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật loại xe", error: error.message });
    }
};

const deleteVehicleType = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;
        await pool.request()
            .input("type_id", sql.Int, id)
            .query(`DELETE FROM VehicleTypes WHERE type_id = @type_id`);

        res.json({ message: "Xóa loại xe thành công" });
    } catch (error) {
        res.status(500).json({
            message: "Không thể xóa loại xe vì đang có bài đăng sử dụng",
            error: error.message
        });
    }
};


const getTopViewedPosts = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT TOP 10
                p.post_id,
                p.title,
                p.price,
                p.view_count,
                b.brand_name,
                m.model_name
            FROM Posts p
            JOIN Brands b ON p.brand_id = b.brand_id
            LEFT JOIN Models m ON p.model_id = m.model_id
            ORDER BY p.view_count DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi lấy top tin được xem nhiều",
            error: error.message
        });
    }
};

const getTopSellersByRating = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT TOP 10
                u.user_id,
                u.full_name,
                COUNT(r.review_id) AS total_reviews,
                ISNULL(AVG(CAST(r.rating AS FLOAT)), 0) AS avg_rating
            FROM Users u
            LEFT JOIN Reviews r ON u.user_id = r.seller_id
            GROUP BY u.user_id, u.full_name
            HAVING COUNT(r.review_id) > 0
            ORDER BY avg_rating DESC, total_reviews DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi lấy top người bán theo đánh giá",
            error: error.message
        });
    }
};

const getTopSellersByFollowers = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT TOP 10
                u.user_id,
                u.full_name,
                COUNT(f.follow_id) AS total_followers
            FROM Users u
            LEFT JOIN Follows f ON u.user_id = f.following_id
            GROUP BY u.user_id, u.full_name
            HAVING COUNT(f.follow_id) > 0
            ORDER BY total_followers DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi lấy top người bán theo lượt theo dõi",
            error: error.message
        });
    }
};

const getPostsByBrand = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                b.brand_name,
                COUNT(p.post_id) AS total_posts
            FROM Brands b
            LEFT JOIN Posts p ON b.brand_id = p.brand_id
            GROUP BY b.brand_name
            ORDER BY total_posts DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi thống kê bài đăng theo hãng xe",
            error: error.message
        });
    }
};


// Lấy tất cả thông báo cho admin
const getAllNotifications = async (req, res) => {
    try {
        console.log("ADMIN NOTIFICATION API CALLED");

        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                n.notification_id,
                n.user_id,
                u.full_name,
                u.email,
                n.title,
                n.content AS message,
                n.is_read,
                n.created_at
            FROM Notifications n
            JOIN Users u ON n.user_id = u.user_id
            ORDER BY n.created_at DESC
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error("NOTIFICATION ERROR:", error);

        res.status(500).json({
            message: "Lỗi lấy danh sách thông báo",
            error: error.message
        });
    }
};

// Admin gửi thông báo cho 1 người dùng
const createNotificationForUser = async (req, res) => {
    try {
        const { user_id, title, message } = req.body;

        if (!user_id || !title || !message) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        const pool = await poolPromise;

        await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("title", sql.NVarChar, title)
            .input("message", sql.NVarChar, message)
            .query(`
    INSERT INTO Notifications(user_id, title, content, is_read, created_at)
    VALUES(@user_id, @title, @message, 0, GETDATE())
`);

        res.status(201).json({
            message: "Gửi thông báo thành công"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi gửi thông báo",
            error: error.message
        });
    }
};

// Admin gửi thông báo cho tất cả người dùng
const createNotificationForAllUsers = async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                message: "Vui lòng nhập tiêu đề và nội dung"
            });
        }

        const pool = await poolPromise;

        await pool.request()
            .input("title", sql.NVarChar, title)
            .input("message", sql.NVarChar, message)
.query(`
    INSERT INTO Notifications(user_id, title, content, is_read, created_at)
    SELECT user_id, @title, @message, 0, GETDATE()
    FROM Users
    WHERE status = 'active'
`);

        res.status(201).json({
            message: "Gửi thông báo cho tất cả người dùng thành công"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi gửi thông báo cho tất cả người dùng",
            error: error.message
        });
    }
};

// Admin xóa thông báo
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;

        await pool.request()
            .input("notification_id", sql.Int, id)
            .query(`
                DELETE FROM Notifications
                WHERE notification_id = @notification_id
            `);

        res.json({
            message: "Xóa thông báo thành công"
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi xóa thông báo",
            error: error.message
        });
    }
};


// Báo cáo tổng quan
const getReportOverview = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute("sp_AdminReportOverview");

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi lấy báo cáo tổng quan",
            error: error.message
        });
    }
};

// Tin đăng theo hãng
const getReportPostsByBrand = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute("sp_AdminPostsByBrand");

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi thống kê tin theo hãng",
            error: error.message
        });
    }
};

// Tin đăng theo loại xe
const getReportPostsByType = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute("sp_AdminPostsByType");

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi thống kê tin theo loại xe",
            error: error.message
        });
    }
};

// Tin đăng theo trạng thái
const getReportPostsByStatus = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute("sp_AdminPostsByStatus");

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi thống kê tin theo trạng thái",
            error: error.message
        });
    }
};

// Top tin được xem nhiều
const getReportTopViewedPosts = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute("sp_AdminTopViewedPosts");

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi lấy top tin xem nhiều",
            error: error.message
        });
    }
};

module.exports = {
     getDashboardStats,

    getAllUsers,
    blockUser,
    unblockUser,

    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand,

    getAllModels,
    createModel,
    updateModel,
    deleteModel,

    getAllVehicleTypes,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,

    getAllNotifications,
    createNotificationForUser,
    createNotificationForAllUsers,
    deleteNotification,

    getReportOverview,
    getReportPostsByBrand,
    getReportPostsByType,
    getReportPostsByStatus,
    getReportTopViewedPosts,


    getTopViewedPosts,
    getTopSellersByRating,
    getTopSellersByFollowers,
    getPostsByBrand
};