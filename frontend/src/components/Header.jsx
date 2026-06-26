import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, Bell, UserCircle } from "lucide-react";

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

    return (
        <header className="site-header">
            <div className="header-container">
                <Link to="/" className="site-logo">
    <img
        src="/logo-choxemay.png"
        alt="ChoXeMay"
        className="header-logo-img"
    />
</Link>

                {!isAdmin && (
                    <>
                        <nav className="main-nav">
                            <Link to="/">Trang chủ</Link>
                            <Link to="/posts">Tin đăng</Link>
                            <Link to="/contact">Liên hệ</Link>
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