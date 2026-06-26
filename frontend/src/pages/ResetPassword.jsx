import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!email || !otp || !newPassword || !confirmPassword) {
            setMessage("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);

            const res = await axiosClient.post("/auth/reset-password", {
                email,
                otp,
                new_password: newPassword
            });

            alert(res.data.message);
            navigate("/login");
        } catch (error) {
            setMessage(error.response?.data?.message || "Lỗi đặt lại mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Đặt lại mật khẩu</h1>
                <p>Nhập OTP đã gửi về email của bạn</p>

                {message && <div className="auth-error">{message}</div>}

                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Mã OTP</label>
                <input
                    value={otp}
                    placeholder="Nhập mã OTP"
                    onChange={(e) => setOtp(e.target.value)}
                />

                <label>Mật khẩu mới</label>
                <input
                    type="password"
                    value={newPassword}
                    placeholder="Nhập mật khẩu mới"
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <label>Xác nhận mật khẩu</label>
                <input
                    type="password"
                    value={confirmPassword}
                    placeholder="Nhập lại mật khẩu mới"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
            </form>
        </main>
    );
}