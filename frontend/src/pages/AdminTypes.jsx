import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function AdminTypes() {
    // Danh sách loại xe
    const [types, setTypes] = useState([]);

    // Trạng thái tải dữ liệu
    const [loading, setLoading] = useState(false);

    // Từ khóa tìm kiếm
    const [keyword, setKeyword] = useState("");

    // Trạng thái mở modal
    const [showModal, setShowModal] = useState(false);

    // Loại xe đang sửa
    const [editingType, setEditingType] = useState(null);

    // Tên loại xe
    const [typeName, setTypeName] = useState("");

    // Lấy danh sách loại xe
    const fetchTypes = async () => {
        try {
            setLoading(true);

            const res = await axiosClient.get("/admin/vehicle-types");

            setTypes(res.data);
        } catch (error) {
            console.error(error);
            alert("Không lấy được danh sách loại xe");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // Đóng modal
    const closeModal = () => {
        setShowModal(false);
        setEditingType(null);
        setTypeName("");
    };

    // Mở modal thêm
    const openAddModal = () => {
        setEditingType(null);
        setTypeName("");
        setShowModal(true);
    };

    // Mở modal sửa
    const openEditModal = (type) => {
        setEditingType(type);
        setTypeName(type.type_name);
        setShowModal(true);
    };

    // Lưu thêm/sửa loại xe
    const handleSaveType = async () => {
        if (!typeName.trim()) {
            alert("Vui lòng nhập tên loại xe");
            return;
        }

        try {
            const payload = {
                type_name: typeName.trim(),
            };

            if (editingType) {
                await axiosClient.put(
                    `/admin/vehicle-types/${editingType.type_id}`,
                    payload
                );

                alert("Cập nhật loại xe thành công");
            } else {
                await axiosClient.post("/admin/vehicle-types", payload);

                alert("Thêm loại xe thành công");
            }

            closeModal();
            fetchTypes();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Lưu loại xe thất bại");
        }
    };

    // Xóa loại xe
    const handleDeleteType = async (typeId) => {
        if (!window.confirm("Bạn có chắc muốn xóa loại xe này?")) return;

        try {
            await axiosClient.delete(`/admin/vehicle-types/${typeId}`);

            alert("Xóa loại xe thành công");
            fetchTypes();
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message ||
                    "Không thể xóa loại xe này"
            );
        }
    };

    // Lọc loại xe
    const filteredTypes = types.filter((type) =>
        type.type_name.toLowerCase().includes(keyword.toLowerCase())
    );

    return (
        <>
            <div className="admin-topbar">
                <div>
                    <h1>Quản lý loại xe</h1>
                    <p>Thêm, sửa hoặc xóa các loại xe trong hệ thống</p>
                </div>
            </div>

            <section className="admin-filter-bar">
                <input
                    placeholder="Tìm theo tên loại xe..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                <button
                    type="button"
                    className="outline-btn"
                    onClick={() => setKeyword("")}
                >
                    Xóa lọc
                </button>

                <button
                    type="button"
                    className="btn-add"
                    onClick={openAddModal}
                >
                    <Plus size={18} />
                    Thêm loại
                </button>
            </section>

            <section className="admin-panel large">
                {loading ? (
                    <p className="admin-empty">Đang tải dữ liệu...</p>
                ) : filteredTypes.length === 0 ? (
                    <p className="admin-empty">Không có loại xe phù hợp</p>
                ) : (
                    <div className="admin-table-scroll">
                        <div className="admin-type-table">
                            <div className="admin-type-head">
                                <span>ID</span>
                                <span>Tên loại xe</span>
                                <span>Thao tác</span>
                            </div>

                            {filteredTypes.map((type) => (
                                <div
                                    className="admin-type-row"
                                    key={type.type_id}
                                >
                                    <span>{type.type_id}</span>
                                    <span>{type.type_name}</span>

                                    <div className="admin-icon-actions">
                                        <button
                                            className="icon-btn edit"
                                            title="Sửa"
                                            onClick={() => openEditModal(type)}
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            className="icon-btn delete"
                                            title="Xóa"
                                            onClick={() =>
                                                handleDeleteType(type.type_id)
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
                            {editingType
                                ? "Chỉnh sửa loại xe"
                                : "Thêm loại xe"}
                        </h2>

                        <label>Tên loại xe</label>

                        <input
                            className="admin-brand-input"
                            value={typeName}
                            onChange={(e) => setTypeName(e.target.value)}
                            placeholder="Nhập tên loại xe..."
                            autoFocus
                        />

                        <button className="btn-save" onClick={handleSaveType}>
                            {editingType ? "Lưu thay đổi" : "Thêm loại xe"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}