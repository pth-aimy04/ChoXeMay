import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import axiosClient from "../api/axiosClient";
const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace("/api", "");

export default function SellerPosts() {
    const [posts, setPosts] = useState([]);

    const fetchMyPosts = async () => {
        const res = await axiosClient.get("/users/my-posts");
        setPosts(res.data);
    };

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa tin này không?")) return;

        await axiosClient.delete(`/posts/${id}`);
        alert("Xóa tin thành công");
        fetchMyPosts();
    };

    const handleMarkSold = async (id) => {
        if (!window.confirm("Đánh dấu tin này là đã bán?")) return;

        await axiosClient.put(`/posts/${id}/mark-sold`);
        alert("Đã đánh dấu là đã bán");
        fetchMyPosts();
    };

    return (
        <main className="seller-posts-page">
            <section className="seller-posts-card">
                <div className="seller-posts-header">
                    <div>
                        <h1>Quản lý tin đăng cá nhân</h1>
                        <p>Xem, thêm, sửa, xóa và đánh dấu xe đã bán.</p>
                    </div>

                    <Link to="/create-post" className="seller-add-btn">
                        <Plus size={18} />
                        Thêm tin đăng
                    </Link>
                </div>

                {posts.length === 0 ? (
                    <div className="seller-empty">
                        <h3>Bạn chưa có tin đăng nào</h3>
                        <p>Hãy thêm tin bán xe đầu tiên của bạn.</p>

                        <Link to="/create-post" className="seller-add-btn">
                            <Plus size={18} />
                            Thêm tin đăng
                        </Link>
                    </div>
                ) : (
                    <div className="seller-post-list">
                        {posts.map((post) => (
                            <div className="seller-post-item" key={post.post_id}>
                               <img
    src={
        post.thumbnail
            ? `${API_URL}${post.thumbnail}`
            : "/no-image.png"
    }
    alt={post.title}
/>

                                <div className="seller-post-info">
                                    <h3>{post.title}</h3>
                                    <p>{post.brand_name} {post.model_name}</p>

                                    <strong>
                                        {Number(post.price).toLocaleString("vi-VN")} đ
                                    </strong>

                                    <span
                                        className={`seller-status status-${post.status}`}
                                    >
                                        {post.is_sold
                                            ? "Đã bán"
                                            : post.status === "approved"
                                            ? "Đang bán"
                                            : post.status === "pending"
                                            ? "Chờ duyệt"
                                            : post.status === "rejected"
                                            ? "Bị từ chối"
                                            : "Đã ẩn"}
                                    </span>
                                    {post.status === "pending" && (
    <p className="seller-note pending">
        ⏳ Tin đăng đang chờ quản trị viên xét duyệt.
    </p>
)}

{post.status === "rejected" && (
    <div className="seller-note rejected">
        <strong>Lý do từ chối:</strong>
        <p>{post.reject_reason}</p>
    </div>
)}
                                </div>

                                <div className="seller-post-actions">
                                    <Link
                                        to={`/edit-post/${post.post_id}`}
                                        className="seller-action-btn"
                                    >
                                        <Pencil size={16} />
                                        Sửa
                                    </Link>

                                    {post.status === "approved" && !post.is_sold && (
    <button
        className="seller-action-btn sold"
        onClick={() => handleMarkSold(post.post_id)}
    >
        <CheckCircle size={16} />
        Đã bán
    </button>
)}

                                    <button
                                        className="seller-action-btn delete"
                                        onClick={() => handleDelete(post.post_id)}
                                    >
                                        <Trash2 size={16} />
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}