import { useEffect, useState } from "react";
import { HeartOff } from "lucide-react";
import axiosClient from "../api/axiosClient";
import PostCard from "../components/PostCard";

export default function SavedPosts() {
    const [posts, setPosts] = useState([]);

    const fetchSavedPosts = async () => {
        try {
            const res = await axiosClient.get("/favorites/my-favorites");
            setPosts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const removeFavorite = async (postId) => {
        try {
            await axiosClient.post(`/favorites/${postId}`);
            setPosts((prev) => prev.filter((p) => p.post_id !== postId));
        } catch (error) {
            console.error(error);
            alert("Không thể bỏ thích tin này");
        }
    };

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    return (
        <main className="posts-page">
            <section className="posts-main saved-page">
                <div className="posts-toolbar">
                    <h2>Tin đã lưu</h2>
                    <span>{posts.length} tin</span>
                </div>

                <div className="posts-list">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div className="saved-item" key={post.post_id}>
                                <PostCard post={post} />

                                <button
                                    className="remove-favorite-btn"
                                    onClick={() => removeFavorite(post.post_id)}
                                    title="Bỏ thích"
                                >
                                    <HeartOff size={20} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-text">Bạn chưa lưu tin nào.</div>
                    )}
                </div>
            </section>
        </main>
    );
}



