import { useEffect, useState } from "react";
import { Trash2, Send, Bell } from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function AdminNotifications() {
    // Danh sách thông báo
    const [notifications, setNotifications] = useState([]);

    // Danh sách người dùng
    const [users, setUsers] = useState([]);

    // Trạng thái tải
    const [loading, setLoading] = useState(false);

    // Bộ lọc
    const [keyword, setKeyword] = useState("");
    const [readFilter, setReadFilter] = useState("all");

    // Form gửi thông báo
    const [sendType, setSendType] = useState("all");
    const [userId, setUserId] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    // Lấy danh sách thông báo
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/admin/notifications");
            setNotifications(res.data);
        } catch (error) {
            console.error(error);
            alert("Không lấy được danh sách thông báo");
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách user để chọn người nhận
    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get("/users/admin/all");
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUsers();
    }, []);

    // Gửi thông báo
    const handleSendNotification = async () => {
        if (!title.trim() || !message.trim()) {
            alert("Vui lòng nhập tiêu đề và nội dung");
            return;
        }

        if (sendType === "user" && !userId) {
            alert("Vui lòng chọn người nhận");
            return;
        }

        try {
            if (sendType === "all") {
                await axiosClient.post("/admin/notifications/all", {
                    title: title.trim(),
                    message: message.trim(),
                });
            } else {
                await axiosClient.post("/admin/notifications/user", {
                    user_id: Number(userId),
                    title: title.trim(),
                    message: message.trim(),
                });
            }

            alert("Gửi thông báo thành công");

            setTitle("");
            setMessage("");
            setUserId("");
            setSendType("all");

            fetchNotifications();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Gửi thông báo thất bại");
        }
    };

    // Xóa thông báo
    const handleDeleteNotification = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;

        try {
            await axiosClient.delete(`/admin/notifications/${id}`);
            alert("Xóa thông báo thành công");
            fetchNotifications();
        } catch (error) {
            console.error(error);
            alert("Xóa thông báo thất bại");
        }
    };

    // Lọc thông báo
    const filteredNotifications = notifications.filter((item) => {
const text = `${item.title || ""} ${item.message || item.content || ""} ${
    item.full_name || ""
} ${item.email || ""}`.toLowerCase();

        const matchKeyword = text.includes(keyword.toLowerCase());

        const matchRead =
            readFilter === "all" ||
            (readFilter === "read" && item.is_read) ||
            (readFilter === "unread" && !item.is_read);

        return matchKeyword && matchRead;
    });

    return (
        <>
            <div className="admin-topbar">
                <div>
                    <h1>Quản lý thông báo</h1>
                    <p>Gửi và quản lý thông báo cho người dùng</p>
                </div>
            </div>

            <section className="admin-notify-form">
                <div className="admin-notify-title">
                    <Bell size={20} />
                    <h2>Gửi thông báo</h2>
                </div>

                <div className="notify-form-grid">
                    <select
                        value={sendType}
                        onChange={(e) => setSendType(e.target.value)}
                    >
                        <option value="all">Gửi cho tất cả người dùng</option>
                        <option value="user">Gửi cho một người dùng</option>
                    </select>

                    {sendType === "user" && (
                        <select
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        >
                            <option value="">Chọn người nhận</option>

                            {users.map((user) => (
                                <option key={user.user_id} value={user.user_id}>
                                    {user.full_name} - {user.email}
                                </option>
                            ))}
                        </select>
                    )}

                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Tiêu đề thông báo..."
                    />

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nội dung thông báo..."
                    />

                    <button onClick={handleSendNotification}>
                        <Send size={17} />
                        Gửi thông báo
                    </button>
                </div>
            </section>

            <section className="admin-filter-bar">
                <input
                    placeholder="Tìm tiêu đề, nội dung, người nhận..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                <select
                    value={readFilter}
                    onChange={(e) => setReadFilter(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="unread">Chưa đọc</option>
                    <option value="read">Đã đọc</option>
                </select>

                <button
                    type="button"
                    className="outline-btn"
                    onClick={() => {
                        setKeyword("");
                        setReadFilter("all");
                    }}
                >
                    Xóa lọc
                </button>
            </section>

            <section className="admin-panel large">
                {loading ? (
                    <p className="admin-empty">Đang tải dữ liệu...</p>
                ) : filteredNotifications.length === 0 ? (
                    <p className="admin-empty">Không có thông báo phù hợp</p>
                ) : (
                    <div className="admin-table-scroll">
                        <div className="admin-notify-table">
                            <div className="admin-notify-head">
                                <span>ID</span>
                                <span>Người nhận</span>
                                <span>Tiêu đề</span>
                                <span>Nội dung</span>
                                <span>Trạng thái</span>
                                <span>Thao tác</span>
                            </div>

                            {filteredNotifications.map((item) => (
                                <div
                                    className="admin-notify-row"
                                    key={item.notification_id}
                                >
                                    <span>{item.notification_id}</span>

                                    <span>
                                        {item.full_name}
                                        <small>{item.email}</small>
                                    </span>

                                    <span>{item.title}</span>

                                    <span>{item.message || item.content}</span>

                                    <span
                                        className={`status-badge ${
                                            item.is_read ? "active" : "blocked"
                                        }`}
                                    >
                                        {item.is_read ? "Đã đọc" : "Chưa đọc"}
                                    </span>

                                    <div className="admin-icon-actions">
                                        <button
                                            className="icon-btn delete"
                                            title="Xóa"
                                            onClick={() =>
                                                handleDeleteNotification(
                                                    item.notification_id
                                                )
                                            }
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}



