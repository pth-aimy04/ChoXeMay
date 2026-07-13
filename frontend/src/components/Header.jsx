import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, Bell, UserCircle, MessageCircleMore } from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function Header() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const isPreviewUser = window.location.search.includes("preview=user");
    const isAdmin = user?.role === "admin" && !isPreviewUser;
    const isLoggedIn = token && !isPreviewUser;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };
    const [unreadMessages, setUnreadMessages] = useState(0); 
    const fetchUnreadMessages = async () => {
    try {
        if (!token) return;

        const res = await axiosClient.get("/chat/unread-count");
        setUnreadMessages(res.data.unread_count || 0);
    } catch (error) {
        console.error("Lỗi lấy số tin nhắn chưa đọc:", error);
    }
};
useEffect(() => {
    fetchUnreadMessages();

    const interval = setInterval(() => {
        fetchUnreadMessages();
    }, 5000);

    return () => clearInterval(interval);
}, [token]);
    return (
        <header className="site-header">
            <div className="header-container">
    {!isAdmin && (
    <Link to="/" className="site-logo">
        <img
            src="/logo-choxemay.png"
            alt="ChoXeMay"
            className="header-logo-img"
        />
    </Link>
)}

                {!isAdmin && (
                    <>
                        <nav className="main-nav">
                            <Link to="/">Trang chủ</Link>
                            <Link to="/posts">Tin đăng</Link>
   
                        </nav>

                        <div className="header-search">
                            <Search size={18} />
                            <input placeholder="Tìm xe cũ..." />
                        </div>
                    </>
                )}

                <div className="header-actions">
                    {isAdmin ? (
                        <>
                            <button
                                className="outline-btn"
                                onClick={() => window.open("/?preview=user", "_blank")}
                            >
                                Trang chủ
                            </button>

                            <button className="outline-btn" onClick={handleLogout}>
                                Đăng xuất
                            </button>
                        </>
                    ) : isLoggedIn ? (
                        <>
                            <Link to="/favorites" className="round-icon">
                                <Heart size={20} />
                            </Link>

                            <Link to="/messages" className="header-chat-btn">
    <MessageCircleMore size={21} />

    {unreadMessages > 0 && (
        <span className="header-chat-badge">
            {unreadMessages > 9 ? "9+" : unreadMessages}
        </span>
    )}
</Link>

                            <Link to="/notifications" className="round-icon">
                                <Bell size={20} />
                            </Link>

                            <Link to="/seller-posts" className="primary-btn">
                                Bán xe
                            </Link>

                            <button className="outline-btn" onClick={handleLogout}>
                                Đăng xuất
                            </button>

                            <button
                                className="round-icon"
                                onClick={() => navigate("/profile")}
                            >
                                <UserCircle size={22} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="outline-btn">
                                Đăng nhập
                            </Link>

                            <Link to="/register" className="primary-btn">
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}