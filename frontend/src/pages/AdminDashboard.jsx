import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [topPosts, setTopPosts] = useState([]);
    const [postsByBrand, setPostsByBrand] = useState([]);

    const fetchDashboard = async () => {
        try {
            const statsRes = await axiosClient.get("/admin/dashboard");
            const topRes = await axiosClient.get("/admin/top-viewed-posts");
            const brandRes = await axiosClient.get("/admin/posts-by-brand");

            setStats(statsRes.data);
            setTopPosts(topRes.data);
            setPostsByBrand(brandRes.data);
        } catch (error) {
            console.error(error);
            alert("Bạn không có quyền truy cập admin");
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (!stats) {
        return <div>Đang tải dashboard...</div>;
    }

    return (
        <>
            <div className="admin-topbar">
                


            </div>

            <section className="admin-stat-row">
                <div className="admin-stat-card blue">
                    <strong>{stats.total_users}</strong>
                    <span>Người dùng</span>
                </div>

                <div className="admin-stat-card orange">
                    <strong>{stats.total_posts}</strong>
                    <span>Tổng tin đăng</span>
                </div>

                <div className="admin-stat-card purple">
                    <strong>{stats.pending_posts}</strong>
                    <span>Chờ duyệt</span>
                </div>

                <div className="admin-stat-card green">
                    <strong>{stats.approved_posts}</strong>
                    <span>Đã duyệt</span>
                </div>

                <div className="admin-stat-card red">
                    <strong>{stats.total_comments}</strong>
                    <span>Bình luận</span>
                </div>
            </section>

            <section className="admin-filter-bar">
                <input placeholder="Tìm kiếm dữ liệu..." />

                <select>
                    <option>Tất cả trạng thái</option>
                </select>

                <select>
                    <option>Tất cả hãng xe</option>
                </select>

                <select>
                    <option>Tất cả người dùng</option>
                </select>
            </section>

            <section className="admin-content-grid">
                <div className="admin-panel large">
                    <h2>Top xe được xem nhiều</h2>

                    <div className="admin-table">
                        <div className="admin-table-head">
                            <span>Tên xe</span>
                            <span>Hãng</span>
                            <span>Giá</span>
                            <span>Lượt xem</span>
                        </div>

                        {topPosts.map((post) => (
                            <div
                                className="admin-table-row"
                                key={post.post_id}
                            >
                                <span>{post.title}</span>

                                <span>{post.brand_name}</span>

                                <span>
                                    {Number(post.price).toLocaleString(
                                        "vi-VN"
                                    )}{" "}
                                    đ
                                </span>

                                <strong>{post.view_count}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-panel">
                    <h2>Thống kê theo hãng</h2>

                    {postsByBrand.map((item) => (
                        <div
                            className="brand-stat"
                            key={item.brand_name}
                        >
                            <span>{item.brand_name}</span>
                            <strong>{item.total_posts}</strong>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}


