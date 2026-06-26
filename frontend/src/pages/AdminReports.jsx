import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Users,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Heart,
    MessageCircle,
    Eye,
} from "lucide-react";
import axiosClient from "../api/axiosClient";

const COLORS = ["#f97316", "#fb923c", "#fdba74", "#22c55e", "#60a5fa"];

export default function AdminReports() {
    // Tổng quan
    const [overview, setOverview] = useState({});

    // Dữ liệu biểu đồ
    const [postsByBrand, setPostsByBrand] = useState([]);
    const [postsByType, setPostsByType] = useState([]);
    const [postsByStatus, setPostsByStatus] = useState([]);
    const [topViewedPosts, setTopViewedPosts] = useState([]);

    // Format tiền
    const formatMoney = (value) =>
        Number(value || 0).toLocaleString("vi-VN") + " VNĐ";

    // Đổi trạng thái sang tiếng Việt
    const statusName = (status) => {
        if (status === "approved") return "Đã duyệt";
        if (status === "pending") return "Chờ duyệt";
        if (status === "rejected") return "Từ chối";
        return status;
    };

    // Lấy dữ liệu báo cáo
    const fetchReports = async () => {
        try {
            const [overviewRes, brandRes, typeRes, statusRes, topRes] =
                await Promise.all([
                    axiosClient.get("/admin/reports/overview"),
                    axiosClient.get("/admin/reports/posts-by-brand"),
                    axiosClient.get("/admin/reports/posts-by-type"),
                    axiosClient.get("/admin/reports/posts-by-status"),
                    axiosClient.get("/admin/reports/top-viewed-posts"),
                ]);

            setOverview(overviewRes.data);
            setPostsByBrand(brandRes.data);
            setPostsByType(typeRes.data);

            setPostsByStatus(
                statusRes.data.map((item) => ({
                    ...item,
                    status_text: statusName(item.status),
                }))
            );

            setTopViewedPosts(topRes.data);
        } catch (error) {
            console.error(error);
            alert("Không lấy được dữ liệu báo cáo");
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <>
            <div className="admin-topbar">
                <div>
                    <h1>Báo cáo thống kê</h1>
                    <p>Thống kê người dùng, tin đăng và hoạt động hệ thống</p>
                </div>
            </div>

            <section className="report-stat-grid">
                <div className="report-stat-card">
                    <Users size={24} />
                    <p>Người dùng</p>
                    <h3>{overview.total_users || 0}</h3>
                </div>

                <div className="report-stat-card">
                    <FileText size={24} />
                    <p>Tổng tin đăng</p>
                    <h3>{overview.total_posts || 0}</h3>
                </div>

                <div className="report-stat-card">
                    <CheckCircle size={24} />
                    <p>Tin đã duyệt</p>
                    <h3>{overview.approved_posts || 0}</h3>
                </div>

                <div className="report-stat-card">
                    <Clock size={24} />
                    <p>Tin chờ duyệt</p>
                    <h3>{overview.pending_posts || 0}</h3>
                </div>

                <div className="report-stat-card">
                    <XCircle size={24} />
                    <p>Tin bị từ chối</p>
                    <h3>{overview.rejected_posts || 0}</h3>
                </div>

                <div className="report-stat-card">
                    <Heart size={24} />
                    <p>Lượt yêu thích</p>
                    <h3>{overview.total_favorites || 0}</h3>
                </div>

                <div className="report-stat-card">
                    <MessageCircle size={24} />
                    <p>Bình luận</p>
                    <h3>{overview.total_comments || 0}</h3>
                </div>

                <div className="report-stat-card wide">
                    <FileText size={24} />
                    <p>Tổng giá trị tin đã duyệt</p>
                    <h3>{formatMoney(overview.total_post_value)}</h3>
                </div>
            </section>

            <section className="report-chart-grid">
                <div className="report-chart-card large">
                    <h2>Số lượng tin đăng theo hãng xe</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={postsByBrand}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="brand_name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="total_posts"
                                name="Số tin đăng"
                                fill="#f97316"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="report-chart-card">
                    <h2>Tỉ lệ tin theo trạng thái</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={postsByStatus}
                                dataKey="total_posts"
                                nameKey="status_text"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                label
                            >
                                {postsByStatus.map((item, index) => (
                                    <Cell
                                        key={item.status}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="report-chart-card large">
                    <h2>Số lượng tin đăng theo loại xe</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={postsByType}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type_name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="total_posts"
                                name="Số tin đăng"
                                fill="#fb923c"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="report-chart-card">
                    <h2>Top tin được xem nhiều</h2>

                    <div className="top-view-list">
                        {topViewedPosts.map((post, index) => (
                            <div className="top-view-item" key={post.post_id}>
                                <strong>#{index + 1}</strong>

                                <div>
                                    <h4>{post.title}</h4>
                                    <p>
                                        {post.brand_name}{" "}
                                        {post.model_name || ""}
                                    </p>
                                </div>

                                <span>
                                    <Eye size={15} />
                                    {post.view_count || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}