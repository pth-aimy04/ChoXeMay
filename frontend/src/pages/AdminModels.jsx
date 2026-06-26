import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function AdminModels() {
    // Danh sách dòng xe
    const [models, setModels] = useState([]);

    // Danh sách hãng xe
    const [brands, setBrands] = useState([]);

    // Trạng thái tải dữ liệu
    const [loading, setLoading] = useState(false);

    // Từ khóa tìm kiếm
    const [keyword, setKeyword] = useState("");

    // Lọc theo hãng xe
    const [brandFilter, setBrandFilter] = useState("all");

    // Trạng thái mở modal
    const [showModal, setShowModal] = useState(false);

    // Dòng xe đang sửa
    const [editingModel, setEditingModel] = useState(null);

    // Form nhập dòng xe
    const [modelName, setModelName] = useState("");
    const [brandId, setBrandId] = useState("");

    // Lấy danh sách dòng xe
    const fetchModels = async () => {
        try {
            setLoading(true);

            const res = await axiosClient.get("/admin/models");

            setModels(res.data);
        } catch (error) {
            console.error(error);
            alert("Không lấy được danh sách dòng xe");
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách hãng xe
    const fetchBrands = async () => {
        try {
            const res = await axiosClient.get("/admin/brands");

            setBrands(res.data);
        } catch (error) {
            console.error(error);
            alert("Không lấy được danh sách hãng xe");
        }
    };

    useEffect(() => {
        fetchModels();
        fetchBrands();
    }, []);

    // Đóng modal
    const closeModal = () => {
        setShowModal(false);
        setEditingModel(null);
        setModelName("");
        setBrandId("");
    };

    // Mở modal thêm
    const openAddModal = () => {
        setEditingModel(null);
        setModelName("");
        setBrandId("");
        setShowModal(true);
    };

    // Mở modal sửa
    const openEditModal = (model) => {
        setEditingModel(model);
        setModelName(model.model_name);
        setBrandId(model.brand_id);
        setShowModal(true);
    };

    // Lưu thêm/sửa dòng xe
    const handleSaveModel = async () => {
        if (!brandId || !modelName.trim()) {
            alert("Vui lòng nhập đầy đủ hãng xe và dòng xe");
            return;
        }

        try {
            const payload = {
                brand_id: Number(brandId),
                model_name: modelName.trim(),
            };

            if (editingModel) {
                await axiosClient.put(
                    `/admin/models/${editingModel.model_id}`,
                    payload
                );

                alert("Cập nhật dòng xe thành công");
            } else {
                await axiosClient.post("/admin/models", payload);

                alert("Thêm dòng xe thành công");
            }

            closeModal();
            fetchModels();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Lưu dòng xe thất bại");
        }
    };

    // Xóa dòng xe
    const handleDeleteModel = async (modelId) => {
        if (!window.confirm("Bạn có chắc muốn xóa dòng xe này?")) return;

        try {
            await axiosClient.delete(`/admin/models/${modelId}`);

            alert("Xóa dòng xe thành công");
            fetchModels();
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message ||
                    "Không thể xóa dòng xe này"
            );
        }
    };

    // Lọc danh sách dòng xe
    const filteredModels = models.filter((model) => {
        const text = `${model.model_name || ""} ${model.brand_name || ""}`.toLowerCase();

        const matchKeyword = text.includes(keyword.toLowerCase());

        const matchBrand =
            brandFilter === "all" ||
            String(model.brand_id) === String(brandFilter);

        return matchKeyword && matchBrand;
    });

    return (
        <>
            <div className="admin-topbar">
                <div>
                    <h1>Quản lý dòng xe</h1>
                    <p>Thêm, sửa hoặc xóa các dòng xe trong hệ thống</p>
                </div>
            </div>

            <section className="admin-filter-bar">
                <input
                    placeholder="Tìm theo tên dòng xe hoặc hãng xe..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                >
                    <option value="all">Tất cả hãng xe</option>

                    {brands.map((brand) => (
                        <option key={brand.brand_id} value={brand.brand_id}>
                            {brand.brand_name}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="outline-btn"
                    onClick={() => {
                        setKeyword("");
                        setBrandFilter("all");
                    }}
                >
                    Xóa lọc
                </button>

                <button
                    type="button"
                    className="btn-add"
                    onClick={openAddModal}
                >
                    <Plus size={18} />
                    Thêm dòng
                </button>
            </section>

            <section className="admin-panel large">
                {loading ? (
                    <p className="admin-empty">Đang tải dữ liệu...</p>
                ) : filteredModels.length === 0 ? (
                    <p className="admin-empty">Không có dòng xe phù hợp</p>
                ) : (
                    <div className="admin-table-scroll">
                        <div className="admin-model-table">
                            <div className="admin-model-head">
                                <span>ID</span>
                                <span>Dòng xe</span>
                                <span>Hãng xe</span>
                                <span>Thao tác</span>
                            </div>

                            {filteredModels.map((model) => (
                                <div
                                    className="admin-model-row"
                                    key={model.model_id}
                                >
                                    <span>{model.model_id}</span>
                                    <span>{model.model_name}</span>
                                    <span>{model.brand_name}</span>

                                    <div className="admin-icon-actions">
                                        <button
                                            className="icon-btn edit"
                                            title="Sửa"
                                            onClick={() => openEditModal(model)}
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            className="icon-btn delete"
                                            title="Xóa"
                                            onClick={() =>
                                                handleDeleteModel(model.model_id)
                                            }
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
                    <div
                        className="admin-brand-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="admin-modal-close"
                            onClick={closeModal}
                        >
                            ×
                        </button>

                        <h2>
                            {editingModel
                                ? "Chỉnh sửa dòng xe"
                                : "Thêm dòng xe"}
                        </h2>

                        <label>Hãng xe</label>

                        <select
                            className="admin-role-select"
                            value={brandId}
                            onChange={(e) => setBrandId(e.target.value)}
                        >
                            <option value="">Chọn hãng xe</option>

                            {brands.map((brand) => (
                                <option
                                    key={brand.brand_id}
                                    value={brand.brand_id}
                                >
                                    {brand.brand_name}
                                </option>
                            ))}
                        </select>

                        <label>Tên dòng xe</label>

                        <input
                            className="admin-brand-input"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            placeholder="Nhập tên dòng xe..."
                            autoFocus
                        />

                        <button className="btn-save" onClick={handleSaveModel}>
                            {editingModel ? "Lưu thay đổi" : "Thêm dòng xe"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}