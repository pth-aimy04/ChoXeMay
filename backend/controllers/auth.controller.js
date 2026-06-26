const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");
const nodemailer = require("nodemailer");

const register = async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        const pool = await poolPromise;

        const checkUser = await pool.request()
            .input("email", sql.VarChar, email)
            .input("phone", sql.VarChar, phone)
            .query(`
                SELECT * FROM Users
                WHERE email = @email OR phone = @phone
            `);

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({
                message: "Email hoặc số điện thoại đã tồn tại"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole = await pool.request()
            .query(`
                SELECT role_id FROM Roles
                WHERE role_name = 'user'
            `);

        const role_id = userRole.recordset[0].role_id;

        await pool.request()
            .input("full_name", sql.NVarChar, full_name)
            .input("email", sql.VarChar, email)
            .input("phone", sql.VarChar, phone)
            .input("password_hash", sql.VarChar, hashedPassword)
            .input("role_id", sql.Int, role_id)
            .query(`
                INSERT INTO Users 
                (full_name, email, phone, password_hash, role_id)
                VALUES 
                (@full_name, @email, @phone, @password_hash, @role_id)
            `);

        return res.status(201).json({
            message: "Đăng ký tài khoản thành công"
        });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            message: "Lỗi server khi đăng ký"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập email và mật khẩu"
            });
        }

        const pool = await poolPromise;

        const result = await pool.request()
            .input("email", sql.VarChar, email)
 .query(`
    SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.password_hash,
        u.avatar_url,
        u.status,
        r.role_name AS role
    FROM Users u
    JOIN Roles r ON u.role_id = r.role_id
    WHERE u.email = @email
`)

        if (result.recordset.length === 0) {
            return res.status(400).json({
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        const user = result.recordset[0];

        if (user.status === "blocked") {
            return res.status(403).json({
                message: "Tài khoản đã bị khóa"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({
                message: "Email hoặc mật khẩu không đúng"
            });
        }

  const token = jwt.sign(
    {
        user_id: user.user_id,
        email: user.email,
        role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

        res.json({
    message: "Đăng nhập thành công",
    token,
    user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        status: user.status,
        role: user.role
    }
});

} catch (error) {
    console.error("========== LOGIN ERROR ==========");
    console.error(error);
    console.error("================================");

    return res.status(500).json({
        message: "Lỗi server khi đăng nhập",
        error: error.message
    });
}
};

const getProfile = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.Int, req.user.user_id)
            .query(`
                SELECT 
                    u.user_id,
                    u.full_name,
                    u.email,
                    u.phone,
                    u.avatar_url,
                    u.bio,
                    u.status,
                    u.is_verified,
                    u.created_at,
                    r.role_name
                FROM Users u
                JOIN Roles r ON u.role_id = r.role_id
                WHERE u.user_id = @user_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            });
        }

        return res.json({
            user: result.recordset[0]
        });

    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({
            message: "Lỗi server khi lấy thông tin cá nhân"
        });
    }
};


const logout = async (req, res) => {
    return res.json({
        message: "Đăng xuất thành công"
    });
};


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Vui lòng nhập email"
            });
        }

        const pool = await poolPromise;

        const userResult = await pool.request()
            .input("email", sql.VarChar, email)
            .query(`
                SELECT user_id, email
                FROM Users
                WHERE email = @email
            `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Email không tồn tại trong hệ thống"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expireTime = new Date(Date.now() + 5 * 60 * 1000);

        await pool.request()
            .input("email", sql.VarChar, email)
            .input("reset_otp", sql.VarChar, otp)
            .input("reset_otp_expire", sql.DateTime, expireTime)
            .query(`
                UPDATE Users
                SET reset_otp = @reset_otp,
                    reset_otp_expire = @reset_otp_expire
                WHERE email = @email
            `);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"${process.env.EMAIL_APP_NAME}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Mã OTP đặt lại mật khẩu ChoXeMay",
            html: `
                <h2>ChoXeMay</h2>
                <p>Mã OTP đặt lại mật khẩu của bạn là:</p>
                <h1>${otp}</h1>
                <p>Mã có hiệu lực trong 5 phút.</p>
            `
        });

        return res.json({
            message: "Mã OTP đã được gửi về email"
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            message: "Lỗi gửi OTP",
            error: error.message
        });
    }
};



const resetPassword = async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;

        if (!email || !otp || !new_password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        const pool = await poolPromise;

        const result = await pool.request()
            .input("email", sql.VarChar, email)
            .input("otp", sql.VarChar, otp)
            .query(`
                SELECT user_id, reset_otp_expire
                FROM Users
                WHERE email = @email
                  AND reset_otp = @otp
            `);

        if (result.recordset.length === 0) {
            return res.status(400).json({
                message: "OTP không đúng"
            });
        }

        const user = result.recordset[0];

        if (new Date(user.reset_otp_expire) < new Date()) {
            return res.status(400).json({
                message: "OTP đã hết hạn"
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        await pool.request()
            .input("email", sql.VarChar, email)
            .input("password_hash", sql.VarChar, hashedPassword)
            .query(`
                UPDATE Users
                SET password_hash = @password_hash,
                    reset_otp = NULL,
                    reset_otp_expire = NULL
                WHERE email = @email
            `);

        return res.json({
            message: "Đặt lại mật khẩu thành công"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Lỗi đặt lại mật khẩu",
            error: error.message
        });
    }
};
module.exports = {
    register,
    login,
    getProfile,
    logout,
    forgotPassword,
    resetPassword
};