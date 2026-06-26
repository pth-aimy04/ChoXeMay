import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const API_URL = "http://localhost:5000";

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [images, setImages] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [mainImage, setMainImage] = useState("");
    const [showPhone, setShowPhone] = useState(false);
    const [saved, setSaved] = useState(false);

    const isLoggedIn = !!localStorage.getItem("token");

    const requireLogin = (message = "Bạn cần đăng nhập để sử dụng chức năng này") => {
        if (!isLoggedIn) {
            alert(message);
            navigate("/login");
            return false;
        }
        return true;
    };

    const fetchPost = async () => {
        try {
            const res = await axiosClient.get(`/posts/${id}`);
            setPost(res.data.post);
            setImages(res.data.images || []);

            if (res.data.images?.length > 0) {
                setMainImage(`${API_URL}${res.data.images[0].image_url}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await axiosClient.get(`/comments/post/${id}`);
            setComments(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const addComment = async (e) => {
        e.preventDefault();

        if (!requireLogin("Bạn cần đăng nhập để bình luận")) return;
        if (!commentText.trim()) return;

        try {
            await axiosClient.post(`/comments/post/${id}`, {
                content: commentText
            });

            setCommentText("");
            fetchComments();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi bình luận");
        }
    };

const toggleFavorite = async () => {
    if (!requireLogin("Bạn cần đăng nhập để lưu tin yêu thích")) return;

    try {
        const res = await axiosClient.post(`/favorites/${id}`);

        if (typeof res.data.is_favorite !== "undefined") {
            setSaved(res.data.is_favorite);
        } else if (typeof res.data.saved !== "undefined") {
            setSaved(res.data.saved);
        } else {
            setSaved((prev) => !prev);
        }

        alert(res.data.message || "Đã cập nhật yêu thích");
    } catch (error) {
        alert(error.response?.data?.message || "Không thể lưu tin");
    }
};

    const handleShowPhone = () => {
        if (!requireLogin("Bạn cần đăng nhập để xem số điện thoại")) return;
        setShowPhone(true);
    };

    const handleChat = () => {
        if (!requireLogin("Bạn cần đăng nhập để chat với người bán")) return;
        alert("Chức năng chat đang được phát triển");
    };


    const fetchFavoriteStatus = async () => {
    if (!isLoggedIn) return;

    try {
        const res = await axiosClient.get(`/favorites/check/${id}`);
        setSaved(res.data.is_favorite);
    } catch (error) {
        console.error("Lỗi kiểm tra yêu thích:", error);
    }
};

useEffect(() => {
    fetchPost();
    fetchComments();

    if (isLoggedIn && id) {
        fetchFavoriteStatus();

        axiosClient.post(`/users/view-history/${id}`)
            .catch((error) => {
                console.log("Lỗi lưu lịch sử xem:", error.response?.data || error);
            });
    }
}, [id]);

    if (!post) {
        return <main className="detail-page">Đang tải...</main>;
    }

    const fallbackImage = "https://placehold.co/700x500?text=ChoXeMay";

    return (
        <main className="detail-page">
            <section className="detail-layout">
                <div className="detail-left">
                    <div className="image-box">
                        <img
                            src={mainImage || fallbackImage}
                            alt={post.title}
                            className="main-image"
                        />

                        <div className="thumb-list">
                            {images.map((img) => (
                                <button
                                    key={img.image_id}
                                    onClick={() => setMainImage(`${API_URL}${img.image_url}`)}
                                >
                                    <img src={`${API_URL}${img.image_url}`} alt="Ảnh xe" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="detail-card">
                        <h2>Mô tả chi tiết</h2>
                        <p>{post.description || "Người bán chưa nhập mô tả."}</p>
                    </div>

                    <div className="detail-card">
                        <h2>Thông số xe</h2>

                        <div className="spec-grid">
                            <div><span>Hãng xe</span><strong>{post.brand_name}</strong></div>
                            <div><span>Dòng xe</span><strong>{post.model_name || "Khác"}</strong></div>
                            <div><span>Loại xe</span><strong>{post.type_name}</strong></div>
                            <div><span>Năm sản xuất</span><strong>{post.manufacture_year || "Không rõ"}</strong></div>
                            <div><span>Số km đã đi</span><strong>{post.mileage || 0} km</strong></div>
                            <div><span>Khu vực</span><strong>{post.ward_name}</strong></div>
                        </div>
                    </div>

                   
                </div>

                <aside className="detail-right">
                    <div className="seller-card detail-info-card">
                        <div className="title-row">
                            <h1>{post.title}</h1>
<button
    onClick={toggleFavorite}
    className={saved ? "save-small active" : "save-small"}
    title={saved ? "Đã lưu tin" : "Lưu tin"}
>
    <span className="heart-icon">
        {saved ? "♥" : "♡"}
    </span>
</button>
                        </div>

                        <p className="detail-meta">
                            {post.manufacture_year} · {post.mileage || 0} km · {post.type_name}
                        </p>

                        <div className="detail-price">
                            {Number(post.price).toLocaleString("vi-VN")} đ
                        </div>

                        <p className="detail-location">
                            📍 {post.location_detail}, {post.ward_name}
                        </p>

                        <div className="action-row">
                            <button onClick={handleChat} className="chat-btn">
                                Chat
                            </button>

                            <button onClick={handleShowPhone} className="phone-btn">
                                {showPhone ? post.seller_phone : `Hiện số ${post.seller_phone?.slice(0, 5)}***`}
                            </button>
                        </div>
                    </div>

                    <div className="seller-card">
                        <h3>Người bán</h3>
                        <div className="seller-profile-row">
                            <div className="seller-avatar">
                                {post.seller_name?.charAt(0)}
                            </div>
                            <div>
                                <strong>{post.seller_name}</strong>
                                <p>Đã tham gia ChoXeMay</p>
                            </div>
                        </div>
                         <div className="detail-card">
                        <h2>Bình luận</h2>

                        <form onSubmit={addComment} className="comment-form">
                            <input
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={isLoggedIn ? "Nhập bình luận..." : "Đăng nhập để bình luận"}
                            />
                            <button type="submit">Gửi</button>
                        </form>

                        <div className="comment-list">
                            {comments.length > 0 ? (
                                comments.map((c) => (
                                    <div className="comment-item" key={c.comment_id}>
                                        <strong>{c.full_name}</strong>
                                        <p>{c.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-text">Chưa có bình luận nào.</p>
                            )}
                        </div>
                    </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}