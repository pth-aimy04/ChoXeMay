import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PostCard from "../components/PostCard";
import {
    Lock,
    Palette,
    FileText,
    X,
    ChevronRight
} from "lucide-react";
import { applyTheme } from "../theme";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace("/api", "");

export default function Profile() {
const [tab, setTab] = useState("posts");
const [user, setUser] = useState(null);
const [posts, setPosts] = useState([]);
const [favorites, setFavorites] = useState([]);
const [history, setHistory] = useState([]);
const [showAccountModal, setShowAccountModal] = useState(false);
const [showPasswordForm, setShowPasswordForm] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [editTab, setEditTab] = useState("profile");
const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
const [forgotMode, setForgotMode] = useState(false);
const [otpSent, setOtpSent] = useState(false);

const [forgotData, setForgotData] = useState({
    email: user?.email || "",
    otp: "",
    new_password: ""
});

const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
});

const handleThemeChange = (mode) => {
    setTheme(mode);
    applyTheme(mode);
};
const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: null
});



    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);

        fetchPosts();
        fetchFavorites();
        fetchHistory();
    }, []);

    const fetchPosts = async () => {
        const res = await axiosClient.get("/users/my-posts");
        setPosts(res.data);
    };

    const fetchFavorites = async () => {
        const res = await axiosClient.get("/favorites/my-favorites");
        setFavorites(res.data);
    };

    const fetchHistory = async () => {
        const res = await axiosClient.get("/users/view-history");
        setHistory(res.data);
    };

    const activePosts = posts.filter((p) => !p.is_sold);
    const soldPosts = posts.filter((p) => p.is_sold);

    const renderPosts = (list) => {
        if (list.length === 0) {
            return <div className="profile-empty">Chưa có dữ liệu.</div>;
        }

        return (
            <div className="profile-post-grid">
                {list.map((post) => (
                    <PostCard key={post.post_id} post={post} />
                ))}
            </div>
        );
    };

    const handlePasswordChange = (e) => {
    setPasswordData({
        ...passwordData,
        [e.target.name]: e.target.value
    });
};

const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
        const res = await axiosClient.put("/users/change-password", passwordData);

        alert(res.data.message);

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

        setShowPasswordForm(false);
    } catch (error) {
        alert(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
};

const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData();

        formData.append("full_name", editForm.full_name);
        formData.append("email", editForm.email);
        formData.append("phone", editForm.phone);
        formData.append("bio", editForm.bio);

        if (editForm.avatar) {
            formData.append("avatar", editForm.avatar);
        }

        const res = await axiosClient.put("/users/me/profile", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert("Cập nhật hồ sơ thành công");
        setShowEditModal(false);
    } catch (error) {
        alert(error.response?.data?.message || "Cập nhật thất bại");
    }
};

const handleForgotChange = (e) => {
    setForgotData({
        ...forgotData,
        [e.target.name]: e.target.value
    });
};

const handleSendOtp = async (e) => {
    e.preventDefault();

    try {
        const res = await axiosClient.post("/auth/forgot-password", {
            email: forgotData.email
        });

        alert(res.data.message);
        setOtpSent(true);
    } catch (error) {
        alert(error.response?.data?.message || "Gửi OTP thất bại");
    }
};

const handleResetPasswordByOtp = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosClient.post("/auth/reset-password", forgotData);

        alert(res.data.message);

        setForgotData({
            email: user?.email || "",
            otp: "",
            new_password: ""
        });

        setForgotMode(false);
        setOtpSent(false);
        setShowPasswordForm(false);
    } catch (error) {
        alert(error.response?.data?.message || "Đặt lại mật khẩu thất bại");
    }
};


    return (
        <main className="profile-page">
            <section className="profile-cover">
                <div className="profile-cover-logo">ChoXeMay</div>
            </section>

<section className="profile-info-card">
    <div className="profile-avatar">
        {user?.avatar_url ? (
            <img
                src={`${API_URL}${user.avatar_url}`}
                alt={user.full_name}
            />
        ) : (
            user?.full_name?.charAt(0)
        )}
    </div>

                <div className="profile-info-main">
                    <h1>{user?.full_name}</h1>

                    <div className="profile-meta">
                        <span>Hoạt động gần đây</span>
                        <span>Email: {user?.email}</span>
                        <span>SĐT: {user?.phone}</span>
                    </div>

                    <div className="profile-rating">
                        <strong>5 ⭐</strong>
                        <span>Đã tham gia ChoXeMay</span>
                    </div>

                   <div className="profile-actions">
    <button>Chia sẻ</button>

<button
    className="profile-action active"
    onClick={() => {
        setEditForm({
            full_name: user?.full_name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            bio: user?.bio || "",
            avatar: null
        });
        setShowEditModal(true);
    }}
>
    Chỉnh sửa hồ sơ
</button>
{showEditModal && (
    <div className="profile-modal-overlay">
        <div className="profile-edit-modal">
            <div className="profile-modal-header">
                <h3>Chỉnh sửa hồ sơ</h3>

                <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-modal-form">
                <label>Ảnh đại diện</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            avatar: e.target.files[0]
                        })
                    }
                />

                <label>Họ và tên</label>
                <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            full_name: e.target.value
                        })
                    }
                />

                <label>Email</label>
                <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            email: e.target.value
                        })
                    }
                />

                <label>Số điện thoại</label>
                <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            phone: e.target.value
                        })
                    }
                />

                <label>Giới thiệu</label>
                <textarea
                    rows="4"
                    value={editForm.bio}
                    placeholder="Viết vài dòng giới thiệu về bạn..."
                    onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            bio: e.target.value
                        })
                    }
                />

                <div className="profile-modal-actions">
                    <button
                        type="button"
                        className="profile-cancel-btn"
                        onClick={() => setShowEditModal(false)}
                    >
                        Hủy
                    </button>

                    <button type="submit" className="profile-save-btn">
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    </div>
)}

    <button onClick={() => setShowAccountModal(true)}>
        Cài đặt tài khoản
    </button>
</div>
                </div>
            </section>

            <section className="profile-stats">
                <div>
                    <strong>{posts.length}</strong>
                    <span>Tất cả tin</span>
                </div>

                <div>
                    <strong>{activePosts.length}</strong>
                    <span>Đang bán</span>
                </div>

                <div>
                    <strong>{soldPosts.length}</strong>
                    <span>Đã bán</span>
                </div>

                <div>
                    <strong>{favorites.length}</strong>
                    <span>Đã lưu</span>
                </div>

                <div>
                    <strong>{history.length}</strong>
                    <span>Đã xem</span>
                </div>
            </section>

            <section className="profile-content-card">
                <h2>Tất cả tin đăng ({posts.length})</h2>

                <div className="profile-tabs">
                    <button
                        className={tab === "posts" ? "active" : ""}
                        onClick={() => setTab("posts")}
                    >
                        Tin đang hoạt động ({activePosts.length})
                    </button>

                    <button
                        className={tab === "sold" ? "active" : ""}
                        onClick={() => setTab("sold")}
                    >
                        Đã bán ({soldPosts.length})
                    </button>

                    <button
                        className={tab === "favorites" ? "active" : ""}
                        onClick={() => setTab("favorites")}
                    >
                        Tin đã lưu ({favorites.length})
                    </button>

                    <button
                        className={tab === "history" ? "active" : ""}
                        onClick={() => setTab("history")}
                    >
                        Lịch sử xem ({history.length})
                    </button>
                </div>

                {tab === "posts" && renderPosts(activePosts)}
                {tab === "sold" && renderPosts(soldPosts)}
                {tab === "favorites" && renderPosts(favorites)}
                {tab === "history" && renderPosts(history)}
            </section>

            {showAccountModal && (
    <div className="profile-modal-overlay">
        <div className="account-setting-modal">
            <div className="setting-modal-header">
                <h2>Cài đặt tài khoản</h2>
               <button onClick={() => setShowAccountModal(false)}>
    <X size={18} />
</button>
            </div>

            <div className="setting-section">
                <h3>
    <Lock size={19} />
    Bảo mật
</h3>
<button
    type="button"
    className="setting-item"
    onClick={() => setShowPasswordForm(!showPasswordForm)}
>
    <span>Đổi mật khẩu</span>
    <ChevronRight size={18} />
</button>
{showPasswordForm && !forgotMode && (
    <form className="password-form" onSubmit={handleChangePassword}>
        <input
            type="password"
            name="currentPassword"
            placeholder="Mật khẩu hiện tại"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
        />
        <button
    type="button"
    className="forgot-password-link"
    onClick={() => {
        setForgotMode(true);
        setOtpSent(false);

        setForgotData({
            email: user?.email || "",
            otp: "",
            new_password: ""
        });
    }}
>
    Bạn quên mật khẩu?
</button>

        <input
            type="password"
            name="newPassword"
            placeholder="Mật khẩu mới"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
        />

        <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu mới"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
        />

        <button type="submit">
            Xác nhận đổi mật khẩu
        </button>
    </form>
)}
{showPasswordForm && forgotMode && (
    <form
        className="password-form"
        onSubmit={otpSent ? handleResetPasswordByOtp : handleSendOtp}
    >
        <input
            type="email"
            name="email"
            placeholder="Email tài khoản"
            value={forgotData.email}
            onChange={handleForgotChange}
            disabled={otpSent}
        />

        {otpSent && (
            <>
                <input
                    type="text"
                    name="otp"
                    placeholder="Nhập mã OTP"
                    value={forgotData.otp}
                    onChange={handleForgotChange}
                />

                <input
                    type="password"
                    name="new_password"
                    placeholder="Mật khẩu mới"
                    value={forgotData.new_password}
                    onChange={handleForgotChange}
                />
            </>
        )}

        <button type="submit">
            {otpSent ? "Đặt lại mật khẩu" : "Gửi OTP"}
        </button>

        <button
            type="button"
            className="back-password-link"
            onClick={() => {
                setForgotMode(false);
                setOtpSent(false);
            }}
        >
            Quay lại đổi mật khẩu
        </button>
    </form>
)}
            </div>

            <div className="setting-section">
               <h3>
    <Palette size={19} />
    Giao diện
</h3>

               <div className="theme-selector">

    <div
        className={`theme-card ${theme === "light" ? "active" : ""}`}
        onClick={() => handleThemeChange("light")}
    >
        <div className="theme-card-left">
            <div className="theme-icon">☀️</div>

            <div>
                <h4>Chế độ sáng</h4>
                <p>Giao diện nền trắng mặc định</p>
            </div>
        </div>

        <div className="theme-radio">
            {theme === "light" && "✓"}
        </div>
    </div>

    <div
        className={`theme-card ${theme === "dark" ? "active" : ""}`}
        onClick={() => handleThemeChange("dark")}
    >
        <div className="theme-card-left">
            <div className="theme-icon">🌙</div>

            <div>
                <h4>Chế độ tối</h4>
                <p>Giảm độ sáng khi sử dụng ban đêm</p>
            </div>
        </div>

        <div className="theme-radio">
            {theme === "dark" && "✓"}
        </div>
    </div>

</div>

</div>

            <div className="setting-section">
                <h3>
    <FileText size={19} />
    Thông tin tài khoản
</h3>

                <div className="setting-info">
                    <span>Email</span>
                    <strong>{user?.email}</strong>
                </div>

                <div className="setting-info">
                    <span>Số điện thoại</span>
                    <strong>{user?.phone}</strong>
                </div>

                <div className="setting-info">
                    <span>Trạng thái</span>
                    <strong>{user?.status || "active"}</strong>
                </div>
            </div>
        </div>
    </div>
)}
        </main>
    );
}



