import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PostCard from "../components/PostCard";

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [brandId, setBrandId] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const fetchPosts = async () => {
        try {
            const res = await axiosClient.get("/posts", {
                params: {
                    keyword: keyword || undefined,
                    brand_id: brandId || undefined,
                    min_price: minPrice || undefined,
                    max_price: maxPrice || undefined
                }
            });

            setPosts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

const clearFilters = async () => {
    setKeyword("");
    setBrandId("");
    setMinPrice("");
    setMaxPrice("");

    try {
        const res = await axiosClient.get("/posts", {
            params: {
                keyword: "",
                brand_id: "",
                min_price: "",
                max_price: ""
            }
        });

        setPosts(res.data);
    } catch (error) {
        console.error(error);
    }
};

    return (
        <main className="posts-page">
            <section className="posts-filter-card">
                <div className="breadcrumb">ChoXeMay / Xe máy / TP Hồ Chí Minh</div>

                <h1>Mua bán xe máy cũ tại TP.HCM</h1>
                <p>
                    Tìm kiếm xe máy cũ theo hãng xe, khoảng giá và khu vực.
                </p>

                <div className="filter-form">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tìm xe..."
                    />

                    <select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                        <option value="">Tất cả hãng</option>
                        <option value="1">Honda</option>
                        <option value="2">Yamaha</option>
                        <option value="3">Suzuki</option>
                        <option value="4">SYM</option>
                        <option value="5">Piaggio</option>
                        <option value="6">VinFast</option>
                    </select>

                    <input
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Giá từ"
                        type="number"
                    />

                    <input
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Giá đến"
                        type="number"
                    />

                    <button onClick={fetchPosts}>Lọc</button>
                    <button onClick={clearFilters} className="clear-btn">Xóa lọc</button>
                </div>
            </section>

            <section className="posts-content">
                <div className="posts-main">
                    <div className="posts-toolbar">
                        <h2>Tin đăng mới nhất</h2>
                        <span>{posts.length} tin</span>
                    </div>

                    <div className="posts-list">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard key={post.post_id} post={post} />
                            ))
                        ) : (
                            <div className="empty-text">Không tìm thấy tin phù hợp.</div>
                        )}
                    </div>
                </div>

<aside className="posts-sidebar">
    <h3>Gợi ý tìm kiếm</h3>

    <button onClick={() => setBrandId("1")}>Honda</button>
    <button onClick={() => setBrandId("2")}>Yamaha</button>
    <button onClick={() => setBrandId("3")}>Suzuki</button>
   

    <button onClick={() => setBrandId("6")}>VinFast</button>

    <button onClick={() => setMinPrice("10000000")}>Trên 10 triệu</button>
    <button onClick={() => setMaxPrice("30000000")}>Dưới 30 triệu</button>
    <button onClick={() => {
        setMinPrice("30000000");
        setMaxPrice("50000000");
    }}>
        Từ 30 - 50 triệu
    </button>


</aside>
            </section>
        </main>
    );
}





