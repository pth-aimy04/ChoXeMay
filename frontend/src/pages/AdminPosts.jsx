import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace("/api", "");

export default function AdminPosts() {
    const [posts, setPosts] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/posts/admin/all");
            setPosts(res.data);
        } catch (error) {
            console.error(error);
            alert("Không lấy được danh sách tin đăng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleApprove = async (postId) => {
        if (!window.confirm("Bạn có chắc muốn duyệt tin này?")) return;

        try {
            await axiosClient.put(`/posts/${postId}/approve`);
            alert("Duyệt tin thành công");
            setSelectedPost(null);
            fetchPosts();
        } catch (error) {
            console.error(error);
            alert("Duyệt tin thất bại");
        }
    };

    const handleReject = async (postId) => {
        const reason = window.prompt("Nhập lý do từ chối:");

        if (reason === null) return;

        try {
            await axiosClient.put(`/posts/${postId}/reject`, {
                reject_reason: reason || "Tin đăng không hợp lệ",
            });

            alert("Đã từ chối tin");
            setSelectedPost(null);
            fetchPosts();
        } catch (error) {
            console.error(error);
            alert("Từ chối tin thất bại");
        }
    };

    const filteredPosts =
        statusFilter === "all"
            ? posts
            : posts.filter((post) => post.status === statusFilter);

    const getStatusText = (status) => {
        if (status === "pending") return "Chờ duyệt";
        if (status === "approved") return "Đã duyệt";
        if (status === "rejected") return "Đã từ chối";
        return status;
    };

    return (
        <>
            <div className="admin-topbar">
                <div>
                    <h1>Quản lý tin đăng</h1>
                    <p>Xem chi tiết tin đăng trước khi duyệt hoặc từ chối</p>
                </div>

                <select
                    className="admin-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Đã từ chối</option>
                </select>
            </div>

            <section className="admin-panel large">
                {loading ? (
                    <p className="admin-empty">Đang tải dữ liệu...</p>
                ) : filteredPosts.length === 0 ? (
                    <p className="admin-empty">Không có tin đăng nào</p>
                ) : (
                    <div className="admin-post-scroll">
                    <div className="admin-post-card-list">
                        {filteredPosts.map((post) => (
                            <div className="admin-post-card" key={post.post_id}>
                                <div className="admin-post-image-box">
                                    {post.images && post.images.length > 0 ? (
    <img
        src={`${API_URL}${post.images[0].image_url}`}
        alt={post.title}
    />
) : (
    <div className="admin-post-no-image">Chưa có ảnh</div>
)}
                                </div>
<div className="admin-post-card-body">
    <div className="admin-post-card-top">
        <span>#{post.post_id}</span>
        <span className={`status-badge ${post.status}`}>
            {getStatusText(post.status)}
        </span>
    </div>

    <h3>{post.title}</h3>

    <p className="admin-card-price">
        {Number(post.price).toLocaleString("vi-VN")} đ
    </p>

    <div className="admin-post-card-actions">
        <button
            className="btn-detail"
            onClick={() => setSelectedPost(post)}
        >
            Xem chi tiết
        </button>
    

                                        {post.status !== "approved" && (
                                            <button
                                                className="btn-approve"
                                                onClick={() => handleApprove(post.post_id)}
                                            >
                                                Duyệt
                                            </button>
                                        )}

                                        {post.status !== "rejected" && (
                                            <button
                                                className="btn-reject"
                                                onClick={() => handleReject(post.post_id)}
                                            >
                                                Từ chối
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                )}
            </section>

            {selectedPost && (
                <div className="admin-modal-overlay" onClick={() => setSelectedPost(null)}>
                    <div
                        className="admin-post-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="admin-modal-close"
                            onClick={() => setSelectedPost(null)}
                        >
                            ×
                        </button>

                        <div className="admin-modal-img-list">
    {selectedPost.images && selectedPost.images.length > 0 ? (
        selectedPost.images.map((img) => (
            <img
                key={img.image_id}
                 src={`${API_URL}${img.image_url}`}
                alt={selectedPost.title}
            />
        ))
    ) : (
        <div className="admin-post-no-image">Chưa có ảnh</div>
    )}
</div>

                        <div className="admin-modal-content">
                           <span className={`status-badge ${selectedPost.status}`}>
    {getStatusText(selectedPost.status)}
</span>

                            <h2>{selectedPost.title}</h2>

                            <div className="admin-detail-grid">
                                <p><b>ID:</b> #{selectedPost.post_id}</p>
                                <p><b>Người đăng:</b> {selectedPost.seller_name}</p>
                                <p><b>Giá:</b> {Number(selectedPost.price).toLocaleString("vi-VN")} đ</p>
                                <p><b>Loại xe:</b> {selectedPost.type_name}</p>
                                <p><b>Hãng xe:</b> {selectedPost.brand_name}</p>
                                <p><b>Dòng xe:</b> {selectedPost.model_name || "Không có"}</p>
                                <p><b>Năm SX:</b> {selectedPost.manufacture_year || "Chưa có"}</p>
                                <p><b>Số km:</b> {selectedPost.mileage?.toLocaleString("vi-VN") || 0} km</p>
                                <p><b>Khu vực:</b> {selectedPost.ward_name}</p>
                                <p><b>Địa chỉ:</b> {selectedPost.location_detail}</p>
                            </div>

                            <div className="admin-description-box">
                                <h4>Mô tả bài viết</h4>
                                <p>{selectedPost.description || "Không có mô tả"}</p>
                            </div>

                            {selectedPost.reject_reason && (
                                <div className="admin-reject-reason">
                                    <b>Lý do từ chối:</b> {selectedPost.reject_reason}
                                </div>
                            )}

                            <div className="admin-modal-actions">
                                {selectedPost.status !== "approved" && (
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleApprove(selectedPost.post_id)}
                                    >
                                        Duyệt tin
                                    </button>
                                )}

                                {selectedPost.status !== "rejected" && (
                                    <button
                                        className="btn-reject"
                                        onClick={() => handleReject(selectedPost.post_id)}
                                    >
                                        Từ chối tin
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}






