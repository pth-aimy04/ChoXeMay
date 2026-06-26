import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axiosClient.post("/auth/login", form);

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            if (res.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
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