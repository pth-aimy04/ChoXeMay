import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await axiosClient.get("/notifications");

            setNotifications(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axiosClient.put(`/notifications/${id}/read`);

            setNotifications((prev) =>
                prev.map((item) =>
                    item.notification_id === id
                        ? { ...item, is_read: true }
                        : item
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <main className="notification-page">
            <div className="notification-header">
                <h1>Thông báo</h1>
                <p>Cập nhật mới nhất từ ChoXeMay</p>
            </div>

            {loading ? (
                <div className="notification-empty">
                    Đang tải...
                </div>
            ) : notifications.length === 0 ? (
                <div className="notification-empty">
                    Bạn chưa có thông báo nào
                </div>
            ) : (
                <div className="notification-list">
                    {notifications.map((item) => (
                        <div
                            key={item.notification_id}
                            className={`notification-card ${
                                item.is_read ? "" : "unread"
                            }`}
                        >
                            <div className="notification-content">
                                <h3>{item.title}</h3>

                                <p>{item.message || item.content}</p>

                                <span>
                                    {new Date(
                                        item.created_at
                                    ).toLocaleString("vi-VN")}
                                </span>
                            </div>

                            {!item.is_read && (
                                <button
                                    onClick={() =>
                                        markAsRead(
                                            item.notification_id
                                        )
                                    }
                                >
                                    Đã đọc
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}