import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Register() {
    const navigate = useNavigate();

    // Lưu dữ liệu đăng ký
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    // Thông báo lỗi và thành công
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Cập nhật dữ liệu khi nhập
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Xử lý đăng ký tài khoản
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Kiểm tra mật khẩu xác nhận
        if (form.password !== form.confirmPassword) {
            setError("Mật khẩu nhập lại không khớp");
            return;
        }

        try {
            // Gửi yêu cầu đăng ký
            const res = await axiosClient.post("/auth/register", {
                full_name: form.full_name,
                email: form.email,
                phone: form.phone,
                password: form.password
            });

            // Thông báo thành công
            setSuccess(res.data.message || "Đăng ký thành công");

            // Chuyển sang trang đăng nhập
            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (err) {
            // Hiển thị lỗi nếu đăng ký thất bại
            setError(err.response?.data?.message || "Đăng ký thất bại");
        }
    };
    return (
        <main className="auth-page">
            <div className="auth-card">
                <h1>Tạo tài khoản</h1>
                <p>Tham gia ChoXeMay để đăng tin và tìm xe phù hợp</p>

                {error && <div className="error-box">{error}</div>}
                {success && <div className="success-box">{success}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Họ tên</label>
                    <input
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        placeholder="Ví dụ: Nguyễn Văn A"
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="exam@gmail.com"
                    />

                    <label>Số điện thoại</label>
                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+84 912 345 678"
                    />

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                    />

                    <label>Nhập lại mật khẩu</label>
<input
    type="password"
    name="confirmPassword"
    value={form.confirmPassword}
    onChange={handleChange}
    placeholder="Nhập lại mật khẩu"
/>

                    <button type="submit">Đăng ký</button>
                </form>

                <div className="auth-links single">
                    <span>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </span>
                </div>
            </div>
        </main>
    );
}