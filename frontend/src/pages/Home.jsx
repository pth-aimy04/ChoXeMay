import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PostCard from "../components/PostCard";

export default function Home() {

    // Lưu danh sách tin đăng và kết quả tìm kiếm
    const [posts, setPosts] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Lấy danh sách tất cả tin đăng
    const fetchPosts = async () => {
        try {
            const res = await axiosClient.get("/posts");
            setPosts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Tìm kiếm tin đăng theo từ khóa hoặc bộ lọc
    const searchPosts = async (params = {}) => {
        try {
            setIsSearching(true);

            const res = await axiosClient.get("/posts", {
                params: {
                    keyword: keyword || undefined,
                    ...params
                }
            });

            setSearchResults(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    // Xử lý khi nhấn nút tìm kiếm
    const handleSearch = () => {
        if (!keyword.trim()) {
            setSearchResults([]);
            return;
        }

        searchPosts();
    };

    // Tìm kiếm theo danh mục gợi ý
    const handleCategoryClick = (value) => {
        setKeyword(value);
        searchPosts({ keyword: value });
    };

    // Tải danh sách tin đăng khi mở trang
    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <main className="home">
            <section className="home-hero">
                <div className="hero-content">
                    <span>Mua bán xe máy cũ</span>
                    <h1>Xe máy tốt, chốt mua nhanh!</h1>
                    <p>
                        Tìm xe phù hợp tại TP Hồ Chí Minh với nhiều lựa chọn rõ ràng,
                        dễ xem.
                    </p>
                </div>
            </section>

            <section className="home-search-box">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm xe máy cũ..."
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />

                <button className="location-btn">TP Hồ Chí Minh</button>

                <button onClick={handleSearch} className="search-btn">
                    Tìm xe
                </button>
            </section>

        {keyword.trim() && searchResults.length > 0 && (
    <section className="home-search-results">
                    <div className="section-header">
                        <h2>Kết quả tìm kiếm</h2>

                        <button
                            className="clear-search-btn"
                            onClick={() => {
                                setKeyword("");
                                setSearchResults([]);
                            }}
                        >
                            Xóa tìm kiếm
                        </button>
                    </div>

                    {isSearching ? (
                        <p className="empty-text">Đang tìm...</p>
                    ) : searchResults.length > 0 ? (
                        <div className="post-grid">
                            {searchResults.map((post) => (
                                <PostCard key={post.post_id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <p className="empty-text">Không tìm thấy tin phù hợp.</p>
                    )}
                </section>
            )}

            <section className="category-panel">
                <button onClick={() => handleCategoryClick("Xe tay ga")}>
                    Xe tay ga
                </button>

                <button onClick={() => handleCategoryClick("Xe số")}>
                    Xe số
                </button>

                <button onClick={() => handleCategoryClick("Xe côn tay")}>
                    Xe côn tay
                </button>

                <button onClick={() => handleCategoryClick("Xe điện")}>
                    Xe điện
                </button>

                <button onClick={() => handleCategoryClick("Honda")}>
                    Honda
                </button>

                <button onClick={() => handleCategoryClick("Yamaha")}>
                    Yamaha
                </button>
            </section>

            <section className="latest-box">
                <div className="section-header">
                    <h2>Mới nhất</h2>
                    <a href="/posts">Xem tất cả</a>
                </div>

                <div className="post-grid">
                    {posts.length > 0 ? (
                        posts.slice(0, 8).map((post) => (
                            <PostCard key={post.post_id} post={post} />
                        ))
                    ) : (
                        <p className="empty-text">Chưa có tin đăng nào.</p>
                    )}
                </div>
            </section>
        </main>
    );
}









