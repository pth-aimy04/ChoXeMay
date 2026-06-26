import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

export default function PostCard({ post }) {
    const imageUrl = post.thumbnail
        ? `${API_URL}${post.thumbnail}`
        : "https://placehold.co/300x220?text=ChoXeMay";

    return (
        <div className="post-card">
            <Link to={`/posts/${post.post_id}`}>
                <img src={imageUrl} alt={post.title} />
            </Link>

            <div className="post-content">
                <Link to={`/posts/${post.post_id}`} className="post-name">
                    {post.title}
                </Link>

                <p className="post-info">
                    {post.manufacture_year} · {post.model_name || "Xe máy"}
                </p>

                <p className="post-price">
                    {Number(post.price).toLocaleString("vi-VN")} đ
                </p>

                <p className="post-address">
                    {post.ward_name || "TP Hồ Chí Minh"}
                </p>
            </div>
        </div>
    );
}