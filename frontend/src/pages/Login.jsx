import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Login() {
    const navigate = useNavigate();

    // Lưu dữ liệu đăng nhập
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    // Thông báo lỗi
    const [error, setError] = useState("");

    // Cập nhật dữ liệu khi nhập
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Xử lý đăng nhập
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Gửi yêu cầu đăng nhập
            const res = await axiosClient.post("/auth/login", form);

            // Lưu token và thông tin người dùng
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            // Điều hướng theo vai trò
            if (res.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
            // Hiển thị lỗi nếu đăng nhập thất bại
            setError(err.response?.data?.message || "Đăng nhập thất bại");
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h1>Đăng nhập</h1>
                <p>Chào mừng bạn quay lại ChoXeMay</p>

                {error && <div className="error-box">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="exam@gmail.com"
                    />

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                    />

                    <button type="submit">Đăng nhập</button>
                </form>

                <div className="auth-links">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                    <span>
                        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                    </span>
                </div>
            </div>
        </main>
    );
}