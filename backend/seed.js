const bcrypt = require("bcryptjs");
const { sql, poolPromise } = require("./config/db");

const password = "123456";

const seedEmails = [
    "admin@gmail.com",
    "admin2@gmail.com",
    ...Array.from({ length: 10 }, (_, i) => `user${i + 1}@gmail.com`)
];

const imageGroups = {
    vision: ["vision_1.jpeg", "vision_2.webp", "vision_3.webp", "vision_4.webp"],
    airblade: ["airblade_1.webp", "airblade_2.webp", "airblade_3.webp", "airblade_4.webp"],
    sh: ["sh_1.jpg", "sh_2.webp", "sh_3.webp", "sh_4.webp"],
    wave: ["wave_1.jpg", "wave_2.jpg", "wave_3.webp", "wave_4.webp"],
    sirius: ["sirius_1.jpg", "sirius_2.webp", "sirius_3.webp", "sirius_4.webp"],
    exciter: ["exciter_1.webp", "exciter_2.webp", "exciter_3.webp", "exciter_4.webp"],
    raider: ["raider_1.jpg", "raider_2.webp", "raider_3.webp", "raider_4.jpeg"],
    attila: ["attila_1.webp", "attila_2.jpg", "attila_3.webp", "attila_4.webp"],
    liberty: ["liberty_1.webp", "liberty_2.jpg", "liberty_3.webp", "liberty_4.webp"],
    evo: ["evo_1.jpg", "evo_2.webp", "evo_3.webp", "evo_4.webp"]
};

const demoPosts = [
    ["Honda Vision 2023", 2, 1, 1, 33500000, 2023, 4200, "vision"],
    ["Honda Vision 2022", 2, 1, 1, 28500000, 2022, 9800, "vision"],
    ["Honda Vision 2021", 2, 1, 1, 25500000, 2021, 14500, "vision"],
    ["Honda Air Blade 2023", 2, 1, 2, 41500000, 2023, 6200, "airblade"],
    ["Honda Air Blade 2021", 2, 1, 2, 33500000, 2021, 18000, "airblade"],
    ["Honda SH 150i 2022", 2, 1, 3, 86500000, 2022, 9000, "sh"],
    ["Honda SH Mode 2021", 2, 1, 3, 58500000, 2021, 13000, "sh"],
    ["Honda Wave Alpha 2023", 1, 1, 4, 18500000, 2023, 5000, "wave"],
    ["Honda Wave Alpha 2020", 1, 1, 4, 13800000, 2020, 25000, "wave"],
    ["Honda Winner X 2022", 3, 1, 5, 34500000, 2022, 12000, "exciter"],

    ["Yamaha Sirius Fi 2022", 1, 2, 6, 16800000, 2022, 11000, "sirius"],
    ["Yamaha Sirius 2020", 1, 2, 6, 12500000, 2020, 27000, "sirius"],
    ["Yamaha Exciter 155 2023", 3, 2, 7, 45500000, 2023, 7000, "exciter"],
    ["Yamaha Exciter 150 2021", 3, 2, 7, 35500000, 2021, 19000, "exciter"],
    ["Yamaha Janus 2022", 2, 2, 8, 24500000, 2022, 15000, "sirius"],
    ["Yamaha Grande 2021", 2, 2, 9, 32500000, 2021, 17000, "sirius"],

    ["Suzuki Raider 150 2022", 3, 3, 10, 36500000, 2022, 14000, "raider"],
    ["Suzuki Raider 2020", 3, 3, 10, 29500000, 2020, 24000, "raider"],
    ["Suzuki Address 2021", 2, 3, 11, 19500000, 2021, 21000, "raider"],

    ["SYM Elizabeth 2020", 2, 4, 12, 17500000, 2020, 26000, "attila"],
    ["SYM Venus 2021", 2, 4, 13, 19500000, 2021, 19000, "attila"],

    ["Piaggio Liberty 2022", 2, 5, 15, 43500000, 2022, 12000, "liberty"],
    ["Piaggio Liberty 2020", 2, 5, 15, 32500000, 2020, 28000, "liberty"],
    ["Vespa Sprint 2021", 2, 5, 14, 62500000, 2021, 18000, "liberty"],

    ["VinFast Klara 2022", 4, 6, 16, 22500000, 2022, 9000, "evo"],
    ["VinFast Vento 2023", 4, 6, 17, 38500000, 2023, 6000, "evo"],
    ["VinFast Evo 200 2023", 4, 6, 17, 24500000, 2023, 4500, "evo"]
];

async function cleanup(pool) {
    const emailList = seedEmails.map(e => `'${e}'`).join(",");

    await pool.request().query(`
        DECLARE @SeedUsers TABLE (user_id INT);
        INSERT INTO @SeedUsers
        SELECT user_id FROM Users WHERE email IN (${emailList});

        DECLARE @SeedPosts TABLE (post_id INT);
        INSERT INTO @SeedPosts
        SELECT post_id FROM Posts WHERE seller_id IN (SELECT user_id FROM @SeedUsers);

        DELETE FROM ViewHistory WHERE user_id IN (SELECT user_id FROM @SeedUsers) OR post_id IN (SELECT post_id FROM @SeedPosts);
        DELETE FROM Notifications WHERE user_id IN (SELECT user_id FROM @SeedUsers) OR related_post_id IN (SELECT post_id FROM @SeedPosts);
        DELETE FROM Favorites WHERE user_id IN (SELECT user_id FROM @SeedUsers) OR post_id IN (SELECT post_id FROM @SeedPosts);
        DELETE FROM Comments WHERE user_id IN (SELECT user_id FROM @SeedUsers) OR post_id IN (SELECT post_id FROM @SeedPosts);
        DELETE FROM Follows WHERE follower_id IN (SELECT user_id FROM @SeedUsers) OR following_id IN (SELECT user_id FROM @SeedUsers);
        DELETE FROM Conversations WHERE buyer_id IN (SELECT user_id FROM @SeedUsers) OR seller_id IN (SELECT user_id FROM @SeedUsers) OR post_id IN (SELECT post_id FROM @SeedPosts);
        DELETE FROM PostImages WHERE post_id IN (SELECT post_id FROM @SeedPosts);
        DELETE FROM Posts WHERE post_id IN (SELECT post_id FROM @SeedPosts);
        DELETE FROM Users WHERE user_id IN (SELECT user_id FROM @SeedUsers);
    `);
}

async function seed() {
    try {
        const pool = await poolPromise;
        await cleanup(pool);

        const hash = await bcrypt.hash(password, 10);

        const users = [];

        const userData = [
            ["Admin ChoXeMay", "admin@gmail.com", "0900000001", 1],
            ["Admin Demo", "admin2@gmail.com", "0900000002", 1],
            ["Nguyễn Minh Anh", "user1@gmail.com", "0901000001", 2],
            ["Trần Quốc Bảo", "user2@gmail.com", "0901000002", 2],
            ["Lê Thị Cẩm Tú", "user3@gmail.com", "0901000003", 2],
            ["Phạm Hoàng Nam", "user4@gmail.com", "0901000004", 2],
            ["Võ Gia Hân", "user5@gmail.com", "0901000005", 2],
            ["Đặng Minh Khang", "user6@gmail.com", "0901000006", 2],
            ["Bùi Thanh Tâm", "user7@gmail.com", "0901000007", 2],
            ["Huỳnh Nhật Linh", "user8@gmail.com", "0901000008", 2],
            ["Đỗ Ngọc Mai", "user9@gmail.com", "0901000009", 2],
            ["Mai Tuấn Kiệt", "user10@gmail.com", "0901000010", 2]
        ];

        for (const u of userData) {
            const result = await pool.request()
                .input("full_name", sql.NVarChar, u[0])
                .input("email", sql.VarChar, u[1])
                .input("phone", sql.VarChar, u[2])
                .input("password_hash", sql.VarChar, hash)
                .input("role_id", sql.Int, u[3])
                .query(`
                    INSERT INTO Users
                    (full_name, email, phone, password_hash, role_id, status, is_verified)
                    OUTPUT INSERTED.user_id
                    VALUES
                    (@full_name, @email, @phone, @password_hash, @role_id, 'active', 1)
                `);

            users.push({
                user_id: result.recordset[0].user_id,
                email: u[1],
                role_id: u[3]
            });
        }

        const normalUsers = users.filter(u => u.role_id === 2);
        const postIds = [];

        const colors = ["Đen", "Trắng", "Đỏ", "Xám", "Xanh", "Bạc"];
        const wards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const streets = [
            "Đường Nguyễn Huệ",
            "Đường Lê Lợi",
            "Đường Cách Mạng Tháng 8",
            "Đường Trường Chinh",
            "Đường Võ Văn Ngân",
            "Đường Phan Văn Trị",
            "Đường Nguyễn Văn Cừ",
            "Đường Điện Biên Phủ"
        ];

        for (let i = 0; i < 40; i++) {
            const p = demoPosts[i % demoPosts.length];
            const seller = normalUsers[i % normalUsers.length];
            const wardId = wards[i % wards.length];
            const status = i % 9 === 0 ? "pending" : i % 13 === 0 ? "rejected" : "approved";

            const result = await pool.request()
                .input("seller_id", sql.Int, seller.user_id)
                .input("title", sql.NVarChar, p[0])
                .input("description", sql.NVarChar, `Xe chính chủ, máy êm, ngoại hình đẹp, giấy tờ đầy đủ. Phù hợp đi học, đi làm trong thành phố.`)
                .input("type_id", sql.Int, p[1])
                .input("brand_id", sql.Int, p[2])
                .input("model_id", sql.Int, p[3])
                .input("price", sql.Decimal(18, 2), p[4])
                .input("manufacture_year", sql.Int, p[5])
                .input("mileage", sql.Int, p[6])
                .input("color", sql.NVarChar, colors[i % colors.length])
                .input("origin", sql.NVarChar, "Việt Nam")
                .input("condition_status", sql.NVarChar, i % 3 === 0 ? "Đã sử dụng" : "Còn tốt")
                .input("engine_capacity", sql.NVarChar, p[1] === 4 ? "Xe điện" : "125cc")
                .input("license_plate", sql.VarChar, `59-A${i + 1}${i + 2}.${1000 + i}`)
                .input("ward_id", sql.Int, wardId)
                .input("location_detail", sql.NVarChar, streets[i % streets.length])
                .input("status", sql.VarChar, status)
                .input("reject_reason", sql.NVarChar, status === "rejected" ? "Ảnh hoặc thông tin chưa rõ ràng" : null)
                .input("view_count", sql.Int, Math.floor(Math.random() * 300) + 10)
                .input("is_sold", sql.Bit, i % 11 === 0 ? 1 : 0)
                .input("is_featured", sql.Bit, i % 7 === 0 ? 1 : 0)
                .query(`
                    INSERT INTO Posts
                    (
                        seller_id, title, description, type_id, brand_id, model_id,
                        price, manufacture_year, mileage, color, origin,
                        condition_status, engine_capacity, license_plate,
                        ward_id, location_detail, status, reject_reason,
                        view_count, is_sold, is_featured
                    )
                    OUTPUT INSERTED.post_id
                    VALUES
                    (
                        @seller_id, @title, @description, @type_id, @brand_id, @model_id,
                        @price, @manufacture_year, @mileage, @color, @origin,
                        @condition_status, @engine_capacity, @license_plate,
                        @ward_id, @location_detail, @status, @reject_reason,
                        @view_count, @is_sold, @is_featured
                    )
                `);

            const postId = result.recordset[0].post_id;
            postIds.push(postId);

            const group = imageGroups[p[7]];

            for (let j = 0; j < group.length; j++) {
                await pool.request()
                    .input("post_id", sql.Int, postId)
                    .input("image_url", sql.NVarChar, `/uploads/demo/${group[j]}`)
                    .input("is_main", sql.Bit, j === 0 ? 1 : 0)
                    .query(`
                        INSERT INTO PostImages (post_id, image_url, is_main)
                        VALUES (@post_id, @image_url, @is_main)
                    `);
            }
        }

        const comments = [
            "Xe còn không bạn?",
            "Giá này còn thương lượng không ạ?",
            "Xe nhìn đẹp quá.",
            "Mình muốn xem xe trực tiếp.",
            "Xe có giấy tờ đầy đủ không?",
            "Máy còn êm không bạn?",
            "Cho mình xin thêm thông tin nha.",
            "Xe còn zin không ạ?"
        ];

        for (let i = 0; i < 50; i++) {
            await pool.request()
                .input("user_id", sql.Int, normalUsers[i % normalUsers.length].user_id)
                .input("post_id", sql.Int, postIds[i % postIds.length])
                .input("content", sql.NVarChar, comments[i % comments.length])
                .query(`
                    INSERT INTO Comments (user_id, post_id, content, status)
                    VALUES (@user_id, @post_id, @content, 'active')
                `);
        }

        for (let i = 0; i < 30; i++) {
            await pool.request()
                .input("user_id", sql.Int, normalUsers[i % normalUsers.length].user_id)
                .input("post_id", sql.Int, postIds[(i * 2) % postIds.length])
                .query(`
                    IF NOT EXISTS (
                        SELECT 1 FROM Favorites
                        WHERE user_id = @user_id AND post_id = @post_id
                    )
                    INSERT INTO Favorites (user_id, post_id)
                    VALUES (@user_id, @post_id)
                `);
        }

        for (let i = 0; i < 30; i++) {
            const follower = normalUsers[i % normalUsers.length];
            const following = normalUsers[(i + 1) % normalUsers.length];

            await pool.request()
                .input("follower_id", sql.Int, follower.user_id)
                .input("following_id", sql.Int, following.user_id)
                .query(`
                    IF @follower_id <> @following_id
                    AND NOT EXISTS (
                        SELECT 1 FROM Follows
                        WHERE follower_id = @follower_id AND following_id = @following_id
                    )
                    INSERT INTO Follows (follower_id, following_id)
                    VALUES (@follower_id, @following_id)
                `);
        }

        for (let i = 0; i < 50; i++) {
            await pool.request()
                .input("user_id", sql.Int, normalUsers[i % normalUsers.length].user_id)
                .input("post_id", sql.Int, postIds[(i * 3) % postIds.length])
                .query(`
                    INSERT INTO ViewHistory (user_id, post_id)
                    VALUES (@user_id, @post_id)
                `);
        }

        for (let i = 0; i < 30; i++) {
            await pool.request()
                .input("user_id", sql.Int, normalUsers[i % normalUsers.length].user_id)
                .input("title", sql.NVarChar, i % 2 === 0 ? "Tin đăng mới phù hợp với bạn" : "Tin đăng của bạn đã được cập nhật")
                .input("content", sql.NVarChar, i % 2 === 0 ? "Có một tin đăng xe máy mới bạn có thể quan tâm." : "Hệ thống đã cập nhật trạng thái tin đăng của bạn.")
                .input("notification_type", sql.VarChar, i % 2 === 0 ? "post" : "system")
                .input("related_post_id", sql.Int, postIds[i % postIds.length])
                .input("is_read", sql.Bit, i % 3 === 0 ? 1 : 0)
                .query(`
                    INSERT INTO Notifications
                    (user_id, title, content, notification_type, related_post_id, is_read)
                    VALUES
                    (@user_id, @title, @content, @notification_type, @related_post_id, @is_read)
                `);
        }

        for (let i = 0; i < 20; i++) {
            const buyer = normalUsers[i % normalUsers.length];
            const seller = normalUsers[(i + 2) % normalUsers.length];

            await pool.request()
                .input("post_id", sql.Int, postIds[i % postIds.length])
                .input("buyer_id", sql.Int, buyer.user_id)
                .input("seller_id", sql.Int, seller.user_id)
                .query(`
                    IF @buyer_id <> @seller_id
                    AND NOT EXISTS (
                        SELECT 1 FROM Conversations
                        WHERE post_id = @post_id
                          AND buyer_id = @buyer_id
                          AND seller_id = @seller_id
                    )
                    INSERT INTO Conversations (post_id, buyer_id, seller_id)
                    VALUES (@post_id, @buyer_id, @seller_id)
                `);
        }

        console.log("Seed dữ liệu thành công!");
        console.log("Admin: admin@gmail.com / 123456");
        console.log("User: user1@gmail.com -> user10@gmail.com / 123456");

        process.exit(0);
    } catch (error) {
        console.error("Seed lỗi:", error);
        process.exit(1);
    }
}

seed();