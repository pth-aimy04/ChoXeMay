import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function AdminBrands() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [brandName, setBrandName] = useState("");

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/admin/brands");
            setBrands(res.data);
        } catch (error) {
            console.error(error);
            alert("Không lấy được danh sách hãng xe");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const closeModal = () => {
        setShowModal(false);
        setEditingBrand(null);
        setBrandName("");
    };

    const openAddModal = () => {
        setEditingBrand(null);
        setBrandName("");
        setShowModal(true);
    };

    const openEditModal = (brand) => {
        setEditingBrand(brand);
        setBrandName(brand.brand_name);
        setShowModal(true);
    };

    const handleSaveBrand = async () => {
        if (!brandName.trim()) {
            alert("Vui lòng nhập tên hãng xe");
            return;
        }

        try {
            if (editingBrand) {
                await axiosClient.put(`/admin/brands/${editingBrand.brand_id}`, {
                    brand_name: brandName.trim(),
                });
                alert("Cập nhật hãng xe thành công");
            } else {
                await axiosClient.post("/admin/brands", {
                    brand_name: brandName.trim(),
                });
                alert("Thêm hãng xe thành công");
            }

            closeModal();
            fetchBrands();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Lưu hãng xe thất bại");
        }
    };

    const handleDeleteBrand = async (brandId) => {
        if (!window.confirm("Bạn có chắc muốn xóa hãng xe này?")) return;

        try {
            await axiosClient.delete(`/admin/brands/${brandId}`);
            alert("Xóa hãng xe thành công");
            fetchBrands();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Không thể xóa hãng xe này");
        }
    };

    const filteredBrands = brands.filter((brand) =>
        brand.brand_name.toLowerCase().includes(keyword.toLowerCase())
    );

    return (
        <>
            <div className="admin-topbar">
                <div>
                    <h1>Quản lý hãng xe</h1>
                    <p>Thêm, sửa hoặc xóa các hãng xe trong hệ thống</p>
                </div>
            </div>

            <section className="admin-filter-bar">
                <input
                    placeholder="Tìm theo tên hãng xe..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                <button type="button" className="outline-btn" onClick={() => setKeyword("")}>
                    Xóa lọc
                </button>

                <button type="button" className="btn-add" onClick={openAddModal}>
                    <Plus size={18} />
                    Thêm hãng
                </button>
            </section>

            <section className="admin-panel large">
                {loading ? (
                    <p className="admin-empty">Đang tải dữ liệu...</p>
                ) : filteredBrands.length === 0 ? (
                    <p className="admin-empty">Không có hãng xe phù hợp</p>
                ) : (
                    <div className="admin-table-scroll">
                        <div className="admin-brand-table">
                            <div className="admin-brand-head">
                                <span>ID</span>
                                <span>Tên hãng xe</span>
                                <span>Thao tác</span>
                            </div>

                            {filteredBrands.map((brand) => (
                                <div className="admin-brand-row" key={brand.brand_id}>
                                    <span>{brand.brand_id}</span>
                                    <span>{brand.brand_name}</span>

                                    <div className="admin-icon-actions">
                                        <button
                                            className="icon-btn edit"
                                            title="Sửa"
                                            onClick={() => openEditModal(brand)}
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            className="icon-btn delete"
                                            title="Xóa"
                                            onClick={() => handleDeleteBrand(brand.brand_id)}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {showModal && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-brand-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="admin-modal-close" onClick={closeModal}>
                            ×
                        </button>

                        <h2>{editingBrand ? "Chỉnh sửa hãng xe" : "Thêm hãng xe"}</h2>

                        <label>Tên hãng xe</label>

                        <input
                            className="admin-brand-input"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="Nhập tên hãng xe..."
                            autoFocus
                        />

                        <button className="btn-save" onClick={handleSaveBrand}>
                            {editingBrand ? "Lưu thay đổi" : "Thêm hãng"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}