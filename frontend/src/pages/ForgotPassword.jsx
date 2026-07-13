import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function ForgotPassword() {
    const navigate = useNavigate();

    // Lưu email và trạng thái xử lý
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Xử lý gửi mã OTP
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // Kiểm tra email
        if (!email) {
            setMessage("Vui lòng nhập email");
            return;
        }

        try {
            setLoading(true);

            // Gửi yêu cầu lấy OTP
            const res = await axiosClient.post("/auth/forgot-password", {
                email
            });

            // Chuyển sang trang đặt lại mật khẩu
            alert(res.data.message);
            navigate("/reset-password", { state: { email } });
        } catch (error) {
            // Hiển thị lỗi
            setMessage(error.response?.data?.message || "Lỗi gửi OTP");
        } finally {
            // Kết thúc xử lý
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Quên mật khẩu</h1>
                <p>Nhập email để nhận mã OTP đặt lại mật khẩu</p>

                {message && <div className="auth-error">{message}</div>}

                <label>Email</label>
                <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Đang gửi..." : "Gửi mã OTP"}
                </button>
            </form>
        </main>
    );
}