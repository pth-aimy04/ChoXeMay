const { sql, poolPromise } = require("../config/db");

const createPost = async (req, res) => {

    try {

        const {
            title,
            description,
            type_id,
            brand_id,
            model_id,
            price,
            manufacture_year,
            mileage,
            ward_id,
            location_detail
        } = req.body;

        const seller_id = req.user.user_id;

        const pool = await poolPromise;

        await pool.request()
            .input("seller_id", sql.Int, seller_id)

            .input("title", sql.NVarChar, title)
            .input("description", sql.NVarChar, description)

            .input("type_id", sql.Int, type_id)
            .input("brand_id", sql.Int, brand_id)
            .input("model_id", sql.Int, model_id)

            .input("price", sql.Decimal(18, 2), price)

            .input("manufacture_year", sql.Int, manufacture_year)
            .input("mileage", sql.Int, mileage)

            .input("ward_id", sql.Int, ward_id)
            .input("location_detail", sql.NVarChar, location_detail)

            .query(`
                INSERT INTO Posts
                (
                    seller_id,

                    title,
                    description,

                    type_id,
                    brand_id,
                    model_id,

                    price,

                    manufacture_year,
                    mileage,

                    ward_id,
                    location_detail,

                    status
                )
                VALUES
                (
                    @seller_id,

                    @title,
                    @description,

                    @type_id,
                    @brand_id,
                    @model_id,

                    @price,

                    @manufacture_year,
                    @mileage,

                    @ward_id,
                    @location_detail,

                    'pending'
                )
            `);

        return res.status(201).json({
            message: "Đăng tin thành công, chờ admin duyệt"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Lỗi tạo tin đăng"
        });

    }

};




const approvePost = async (req, res) => {
    try {
        const { id } = req.params;
        const admin_id = req.user.user_id;

        const pool = await poolPromise;

        await pool.request()
            .input("post_id", sql.Int, id)
            .query(`
                UPDATE Posts
                SET status = 'approved',
                    updated_at = GETDATE()
                WHERE post_id = @post_id
            `);

        await pool.request()
            .input("admin_id", sql.Int, admin_id)
            .input("post_id", sql.Int, id)
            .input("action", sql.NVarChar, 'Duyệt bài đăng')
            .input("note", sql.NVarChar, 'Bài đăng đã được duyệt')
            .query(`
                INSERT INTO AdminLogs(admin_id, post_id, action, note)
                VALUES(@admin_id, @post_id, @action, @note)
            `);

        res.json({
            message: "Duyệt bài đăng thành công"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi duyệt bài đăng"
        });
    }
};

const rejectPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { reject_reason } = req.body;
        const admin_id = req.user.user_id;

        const pool = await poolPromise;

        await pool.request()
            .input("post_id", sql.Int, id)
            .input("reject_reason", sql.NVarChar, reject_reason)
            .query(`
                UPDATE Posts
                SET status = 'rejected',
                    reject_reason = @reject_reason,
                    updated_at = GETDATE()
                WHERE post_id = @post_id
            `);

        await pool.request()
            .input("admin_id", sql.Int, admin_id)
            .input("post_id", sql.Int, id)
            .input("action", sql.NVarChar, 'Từ chối bài đăng')
            .input("note", sql.NVarChar, reject_reason)
            .query(`
                INSERT INTO AdminLogs(admin_id, post_id, action, note)
                VALUES(@admin_id, @post_id, @action, @note)
            `);

        res.json({
            message: "Từ chối bài đăng thành công"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi từ chối bài đăng"
        });
    }
};

const getPosts = async (req, res) => {
    try {
        const {
            keyword,
            brand_id,
            model_id,
            type_id,
            ward_id,
            min_price,
            max_price
        } = req.query;

        const pool = await poolPromise;

        let query = `
            SELECT
                p.post_id,
                p.title,
                p.price,
                p.manufacture_year,
                p.mileage,
                p.location_detail,
                p.created_at,

                b.brand_name,
                m.model_name,
                vt.type_name,
                w.ward_name,
                u.full_name,

                (
                    SELECT TOP 1 image_url
                    FROM PostImages
                    WHERE post_id = p.post_id
                    ORDER BY is_main DESC
                ) AS thumbnail

            FROM Posts p
            JOIN Brands b ON p.brand_id = b.brand_id
            LEFT JOIN Models m ON p.model_id = m.model_id
            JOIN VehicleTypes vt ON p.type_id = vt.type_id
            JOIN Wards w ON p.ward_id = w.ward_id
            JOIN Users u ON p.seller_id = u.user_id

            WHERE p.status = 'approved'
              AND p.is_sold = 0
        `;

        const request = pool.request();

        if (keyword) {
    const words = keyword.trim().split(/\s+/);

    query += ` AND (`;

    const conditions = words.map((_, index) => `
        (
            p.title LIKE @keyword${index}
            OR p.description LIKE @keyword${index}
            OR b.brand_name LIKE @keyword${index}
            OR m.model_name LIKE @keyword${index}
            OR vt.type_name LIKE @keyword${index}
        )
    `);

    query += conditions.join(" OR ");
    query += `)`;

    words.forEach((word, index) => {
        request.input(`keyword${index}`, sql.NVarChar, `%${word}%`);
    });
}

        if (brand_id) {
            query += ` AND p.brand_id = @brand_id`;
            request.input("brand_id", sql.Int, brand_id);
        }

        if (model_id) {
            query += ` AND p.model_id = @model_id`;
            request.input("model_id", sql.Int, model_id);
        }

        if (type_id) {
            query += ` AND p.type_id = @type_id`;
            request.input("type_id", sql.Int, type_id);
        }

        if (ward_id) {
            query += ` AND p.ward_id = @ward_id`;
            request.input("ward_id", sql.Int, ward_id);
        }

        if (min_price) {
            query += ` AND p.price >= @min_price`;
            request.input("min_price", sql.Decimal(18, 2), min_price);
        }

        if (max_price) {
            query += ` AND p.price <= @max_price`;
            request.input("max_price", sql.Decimal(18, 2), max_price);
        }

        query += ` ORDER BY p.created_at DESC`;

        const result = await request.query(query);

        return res.json(result.recordset);

    } catch (error) {
        console.error("Get posts error:", error);
        return res.status(500).json({
            message: "Lỗi lấy danh sách bài đăng",
            error: error.message
        });
    }
};



const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;

        await pool.request()
            .input("post_id", sql.Int, id)
            .query(`
                UPDATE Posts
                SET view_count = view_count + 1
                WHERE post_id = @post_id
            `);

        const result = await pool.request()
            .input("post_id", sql.Int, id)
            .query(`
                SELECT
                    p.*,

                    b.brand_name,
                    m.model_name,
                    vt.type_name,
                    w.ward_name,

                    u.user_id AS seller_id,
                    u.full_name AS seller_name,
                    u.phone AS seller_phone,
                    u.avatar_url AS seller_avatar,
                    u.created_at AS seller_joined_at

                FROM Posts p

                JOIN Brands b ON p.brand_id = b.brand_id
                LEFT JOIN Models m ON p.model_id = m.model_id
                JOIN VehicleTypes vt ON p.type_id = vt.type_id
                JOIN Wards w ON p.ward_id = w.ward_id
                JOIN Users u ON p.seller_id = u.user_id

                WHERE p.post_id = @post_id
                  AND p.status = 'approved'
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy bài đăng"
            });
        }

        const images = await pool.request()
            .input("post_id", sql.Int, id)
            .query(`
                SELECT image_id, image_url, is_main
                FROM PostImages
                WHERE post_id = @post_id
                ORDER BY is_main DESC, image_id ASC
            `);

        return res.json({
            post: result.recordset[0],
            images: images.recordset
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Lỗi lấy chi tiết bài đăng"
        });
    }
};


const uploadPostImages = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "Vui lòng chọn ít nhất 1 ảnh"
            });
        }

        const pool = await poolPromise;

        for (let i = 0; i < req.files.length; i++) {
            const imageUrl = `/uploads/${req.files[i].filename}`;
            const isMain = i === 0 ? 1 : 0;

            await pool.request()
                .input("post_id", sql.Int, id)
                .input("image_url", sql.NVarChar, imageUrl)
                .input("is_main", sql.Bit, isMain)
                .query(`
                    INSERT INTO PostImages(post_id, image_url, is_main)
                    VALUES(@post_id, @image_url, @is_main)
                `);
        }

        res.status(201).json({
            message: "Upload ảnh thành công",
            files: req.files.map(file => `/uploads/${file.filename}`)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi upload ảnh"
        });
    }
};


const markAsSold = async (req, res) => {
    try {

        const { id } = req.params;
        const user_id = req.user.user_id;

        const pool = await poolPromise;

        const check = await pool.request()
            .input("post_id", sql.Int, id)
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT *
                FROM Posts
                WHERE post_id = @post_id
                  AND seller_id = @user_id
            `);

        if (check.recordset.length === 0) {
            return res.status(403).json({
                message: "Bạn không có quyền cập nhật bài đăng này"
            });
        }

        await pool.request()
            .input("post_id", sql.Int, id)
            .query(`
                UPDATE Posts
                SET is_sold = 1,
                    updated_at = GETDATE()
                WHERE post_id = @post_id
            `);

        return res.json({
            message: "Đánh dấu đã bán thành công"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Lỗi cập nhật trạng thái đã bán",
            error: error.message
        });

    }
};


const updatePost = async (req, res) => {
    try {

        const { id } = req.params;
        const user_id = req.user.user_id;

        const {
            title,
            description,
            price,
            manufacture_year,
            mileage,
            ward_id,
            location_detail
        } = req.body;

        const pool = await poolPromise;

        const check = await pool.request()
            .input("post_id", sql.Int, id)
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT *
                FROM Posts
                WHERE post_id = @post_id
                  AND seller_id = @user_id
            `);

        if (check.recordset.length === 0) {
            return res.status(403).json({
                message: "Bạn không có quyền sửa bài đăng này"
            });
        }

        await pool.request()
            .input("post_id", sql.Int, id)

            .input("title", sql.NVarChar, title)
            .input("description", sql.NVarChar, description)

            .input("price", sql.Decimal(18,2), price)

            .input("manufacture_year", sql.Int, manufacture_year)
            .input("mileage", sql.Int, mileage)

            .input("ward_id", sql.Int, ward_id)
            .input("location_detail", sql.NVarChar, location_detail)

            .query(`
                UPDATE Posts
                SET
                    title = @title,
                    description = @description,

                    price = @price,

                    manufacture_year = @manufacture_year,
                    mileage = @mileage,

                    ward_id = @ward_id,
                    location_detail = @location_detail,

                    updated_at = GETDATE()

                WHERE post_id = @post_id
            `);

        return res.json({
            message: "Cập nhật bài đăng thành công"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Lỗi cập nhật bài đăng",
            error: error.message
        });

    }
};


const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        const pool = await poolPromise;

        const check = await pool.request()
            .input("post_id", sql.Int, id)
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT *
                FROM Posts
                WHERE post_id = @post_id
                  AND seller_id = @user_id
            `);

        if (check.recordset.length === 0) {
            return res.status(403).json({
                message: "Bạn không có quyền xóa bài đăng này"
            });
        }

        await pool.request()
    .input("post_id", sql.Int, id)
    .query(`
        UPDATE Posts
        SET status = 'hidden',
            updated_at = GETDATE()
        WHERE post_id = @post_id
    `);

        return res.json({
            message: "Ẩn bài đăng thành công"
        });

    } catch (error) {
        console.error("Delete post error:", error);
        return res.status(500).json({
            message: "Lỗi xóa bài đăng",
            error: error.message
        });
    }
};

const getAdminPosts = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                p.post_id,
                p.title,
                p.description,
                p.price,
                p.status,
                p.created_at,
                p.reject_reason,
                p.manufacture_year,
                p.mileage,
                p.location_detail,

                b.brand_name,
                m.model_name,
                vt.type_name,
                w.ward_name,
                u.full_name AS seller_name,

                (
                    SELECT 
                        pi.image_id,
                        pi.image_url,
                        pi.is_main
                    FROM PostImages pi
                    WHERE pi.post_id = p.post_id
                    ORDER BY pi.is_main DESC, pi.image_id ASC
                    FOR JSON PATH
                ) AS images

            FROM Posts p
            JOIN Brands b ON p.brand_id = b.brand_id
            LEFT JOIN Models m ON p.model_id = m.model_id
            JOIN VehicleTypes vt ON p.type_id = vt.type_id
            JOIN Wards w ON p.ward_id = w.ward_id
            JOIN Users u ON p.seller_id = u.user_id
            WHERE p.status IN ('pending', 'approved', 'rejected')
            ORDER BY p.created_at DESC
        `);

        const posts = result.recordset.map((post) => ({
            ...post,
            images: post.images ? JSON.parse(post.images) : []
        }));

        return res.json(posts);
    } catch (error) {
        console.error("Get admin posts error:", error);
        return res.status(500).json({
            message: "Lỗi lấy danh sách tin đăng admin",
            error: error.message
        });
    }
};
const getAdminPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("post_id", sql.Int, id)
            .query(`
                SELECT
                    p.*,
                    b.brand_name,
                    m.model_name,
                    vt.type_name,
                    w.ward_name,
                    u.full_name AS seller_name,
                    u.phone AS seller_phone
                FROM Posts p
                JOIN Brands b ON p.brand_id = b.brand_id
                LEFT JOIN Models m ON p.model_id = m.model_id
                JOIN VehicleTypes vt ON p.type_id = vt.type_id
                JOIN Wards w ON p.ward_id = w.ward_id
                JOIN Users u ON p.seller_id = u.user_id
                WHERE p.post_id = @post_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy tin đăng" });
        }

        const images = await pool.request()
            .input("post_id", sql.Int, id)
            .query(`
                SELECT image_id, image_url, is_main
                FROM PostImages
                WHERE post_id = @post_id
                ORDER BY is_main DESC, image_id ASC
            `);

        return res.json({
            post: result.recordset[0],
            images: images.recordset
        });
    } catch (error) {
        console.error("Get admin post detail error:", error);
        return res.status(500).json({
            message: "Lỗi lấy chi tiết tin đăng admin",
            error: error.message
        });
    }
};

const updatePostImages = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "Vui lòng chọn ít nhất 1 ảnh"
            });
        }

        const pool = await poolPromise;

        const check = await pool.request()
            .input("post_id", sql.Int, id)
            .input("user_id", sql.Int, user_id)
            .query(`
                SELECT post_id
                FROM Posts
                WHERE post_id = @post_id
                  AND seller_id = @user_id
            `);

        if (check.recordset.length === 0) {
            return res.status(403).json({
                message: "Bạn không có quyền sửa ảnh bài đăng này"
            });
        }

        await pool.request()
            .input("post_id", sql.Int, id)
            .query(`
                DELETE FROM PostImages
                WHERE post_id = @post_id
            `);

        for (let i = 0; i < req.files.length; i++) {
            const imageUrl = `/uploads/${req.files[i].filename}`;
            const isMain = i === 0 ? 1 : 0;

            await pool.request()
                .input("post_id", sql.Int, id)
                .input("image_url", sql.NVarChar, imageUrl)
                .input("is_main", sql.Bit, isMain)
                .query(`
                    INSERT INTO PostImages(post_id, image_url, is_main)
                    VALUES(@post_id, @image_url, @is_main)
                `);
        }

        return res.json({
            message: "Cập nhật ảnh bài đăng thành công"
        });
    } catch (error) {
        console.error("Update post images error:", error);
        return res.status(500).json({
            message: "Lỗi cập nhật ảnh bài đăng",
            error: error.message
        });
    }
};

module.exports = {
    createPost,
    approvePost,
    rejectPost,
    getPosts,
    getAdminPosts,
    getAdminPostById,
    getPostById,
    uploadPostImages,
    markAsSold,
    updatePost,
    deletePost,
    updatePostImages
};