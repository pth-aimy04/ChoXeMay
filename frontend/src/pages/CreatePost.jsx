import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function CreatePost() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        type_id: "",
        brand_id: "",
        model_id: "",
        price: "",
        manufacture_year: "",
        mileage: "",
        ward_id: "",
        location_detail: ""
    });

    const [images, setImages] = useState([]);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleImages = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            setMessage("Bạn cần đăng nhập để đăng tin");
            setTimeout(() => navigate("/login"), 800);
            return;
        }

        if (
            !form.title ||
            !form.type_id ||
            !form.brand_id ||
            !form.price ||
            !form.ward_id ||
            !form.location_detail
        ) {
            setMessage("Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage("");

            const res = await axiosClient.post("/posts", {
                title: form.title,
                description: form.description,
                type_id: Number(form.type_id),
                brand_id: Number(form.brand_id),
                model_id: form.model_id ? Number(form.model_id) : null,
                price: Number(form.price),
                manufacture_year: form.manufacture_year
                    ? Number(form.manufacture_year)
                    : null,
                mileage: form.mileage ? Number(form.mileage) : null,
                ward_id: Number(form.ward_id),
                location_detail: form.location_detail
            });

            const postId = res.data.post_id;

            if (images.length > 0) {
                if (!postId) {
                    setMessage(
                        "Tin đã tạo nhưng chưa upload được ảnh vì backend chưa trả post_id"
                    );
                    return;
                }

                const formData = new FormData();

                images.forEach((img) => {
                    formData.append("images", img);
                });

                await axiosClient.post(`/posts/${postId}/images`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }

            setMessage("Đăng tin thành công, chờ admin duyệt");

            setTimeout(() => {
                navigate("/profile");
            }, 1000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Lỗi đăng tin");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="create-page">
            <div className="create-card">
                <h1>Đăng tin bán xe</h1>
                <p>
                    Nhập thông tin xe máy cần bán. Tin sẽ được hiển thị sau khi admin duyệt.
                </p>

                {message && <div className="success-box">{message}</div>}

                <form onSubmit={handleSubmit} className="create-form">
                    <label>Tiêu đề tin đăng *</label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="VD: Honda Vision 2022 chính chủ"
                    />

                    <label>Mô tả chi tiết</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Mô tả tình trạng xe, giấy tờ, lý do bán..."
                    />

                    <div className="form-grid">
                        <div>
                            <label>Loại xe *</label>
                            <select
                                name="type_id"
                                value={form.type_id}
                                onChange={handleChange}
                            >
                                <option value="">Chọn loại xe</option>
                                <option value="1">Xe số</option>
                                <option value="2">Xe tay ga</option>
                                <option value="3">Xe côn tay</option>
                                <option value="4">Xe điện</option>
                            </select>
                        </div>

                        <div>
                            <label>Hãng xe *</label>
                            <select
                                name="brand_id"
                                value={form.brand_id}
                                onChange={handleChange}
                            >
                                <option value="">Chọn hãng</option>
                                <option value="1">Honda</option>
                                <option value="2">Yamaha</option>
                                <option value="3">Suzuki</option>
                                <option value="4">SYM</option>
                                <option value="5">Piaggio</option>
                                <option value="6">VinFast</option>
                            </select>
                        </div>

                        <div>
                            <label>Dòng xe</label>
                            <select
                                name="model_id"
                                value={form.model_id}
                                onChange={handleChange}
                            >
                                <option value="">Chọn dòng xe</option>
                                <option value="1">Vision</option>
                                <option value="2">Air Blade</option>
                                <option value="3">SH</option>
                                <option value="4">Wave Alpha</option>
                                <option value="6">Sirius</option>
                                <option value="7">Exciter</option>
                            </select>
                        </div>

                        <div>
                            <label>Giá bán *</label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="VD: 28000000"
                            />
                        </div>

                        <div>
                            <label>Năm sản xuất</label>
                            <input
                                type="number"
                                name="manufacture_year"
                                value={form.manufacture_year}
                                onChange={handleChange}
                                placeholder="VD: 2022"
                            />
                        </div>

                        <div>
                            <label>Số km đã đi</label>
                            <input
                                type="number"
                                name="mileage"
                                value={form.mileage}
                                onChange={handleChange}
                                placeholder="VD: 15000"
                            />
                        </div>

                        <div>
                            <label>Phường *</label>
                            <select
                                name="ward_id"
                                value={form.ward_id}
                                onChange={handleChange}
                            >
                                <option value="">Chọn phường</option>
                                <option value="1">Phường Sài Gòn</option>
                                <option value="2">Phường Bến Thành</option>
                                <option value="3">Phường Tân Định</option>
                                <option value="4">Phường An Khánh</option>
                                <option value="5">Phường Bình Tây</option>
                            </select>
                        </div>

                        <div>
                            <label>Đường / khu vực *</label>
                            <input
                                name="location_detail"
                                value={form.location_detail}
                                onChange={handleChange}
                                placeholder="VD: Nguyễn Huệ"
                            />
                        </div>
                    </div>

                    <label>Ảnh xe</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImages}
                    />

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Đang đăng..." : "Đăng tin"}
                    </button>
                </form>
            </div>
        </main>
    );
}