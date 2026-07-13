import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace("/api", "");

export default function EditPost() {
    const { id } = useParams();
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

    const [oldImages, setOldImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const res = await axiosClient.get(`/posts/${id}`);
            const post = res.data.post;

            setForm({
                title: post.title || "",
                description: post.description || "",
                type_id: post.type_id || "",
                brand_id: post.brand_id || "",
                model_id: post.model_id || "",
                price: post.price || "",
                manufacture_year: post.manufacture_year || "",
                mileage: post.mileage || "",
                ward_id: post.ward_id || "",
                location_detail: post.location_detail || ""
            });

            setOldImages(res.data.images || []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Không lấy được tin đăng");
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(files);

        const previews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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

            await axiosClient.put(`/posts/${id}`, {
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

            if (newImages.length > 0) {
                const formData = new FormData();

                newImages.forEach((img) => {
                    formData.append("images", img);
                });

                await axiosClient.put(`/posts/${id}/images`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }

            setMessage("Cập nhật tin đăng thành công");

            setTimeout(() => {
                navigate("/seller-posts");
            }, 800);
        } catch (error) {
            setMessage(error.response?.data?.message || "Cập nhật tin đăng thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="create-page">
            <div className="create-card">
                <h1>Sửa tin đăng</h1>
                <p>Cập nhật thông tin và hình ảnh xe máy cần bán.</p>

                {message && <div className="success-box">{message}</div>}

                <form onSubmit={handleSubmit} className="create-form">
                    <label>Tiêu đề tin đăng *</label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                    />

                    <label>Mô tả chi tiết</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                    />

                    <div className="form-grid">
                        <div>
                            <label>Loại xe *</label>
                            <select name="type_id" value={form.type_id} onChange={handleChange}>
                                <option value="">Chọn loại xe</option>
                                <option value="1">Xe số</option>
                                <option value="2">Xe tay ga</option>
                                <option value="3">Xe côn tay</option>
                                <option value="4">Xe điện</option>
                            </select>
                        </div>

                        <div>
                            <label>Hãng xe *</label>
                            <select name="brand_id" value={form.brand_id} onChange={handleChange}>
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
                            <select name="model_id" value={form.model_id} onChange={handleChange}>
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
                            <input type="number" name="price" value={form.price} onChange={handleChange} />
                        </div>

                        <div>
                            <label>Năm sản xuất</label>
                            <input type="number" name="manufacture_year" value={form.manufacture_year} onChange={handleChange} />
                        </div>

                        <div>
                            <label>Số km đã đi</label>
                            <input type="number" name="mileage" value={form.mileage} onChange={handleChange} />
                        </div>

                        <div>
                            <label>Phường *</label>
                            <select name="ward_id" value={form.ward_id} onChange={handleChange}>
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
                            <input name="location_detail" value={form.location_detail} onChange={handleChange} />
                        </div>
                    </div>

                 <label>Ảnh hiện tại</label>
<div className="edit-image-grid">
    {oldImages.length > 0 ? (
        oldImages.map((img) => (
            <img
                key={img.image_id}
                src={`${API_URL}${img.image_url}`}
                alt="Ảnh hiện tại"
            />
        ))
    ) : (
        <p className="edit-no-image">Chưa có ảnh.</p>
    )}
</div>

                    <label>Chọn ảnh mới nếu muốn thay đổi</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImages}
                    />

                    {previewImages.length > 0 && (
                        <>
                            <label>Ảnh mới sẽ thay thế ảnh cũ</label>
                            <div className="edit-image-grid">
                                {previewImages.map((src, index) => (
                                    <img key={index} src={src} alt="Ảnh mới" />
                                ))}
                            </div>
                        </>
                    )}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </form>
            </div>
        </main>
    );
}