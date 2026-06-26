import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
    Pencil,
    Lock,
    Unlock
} from "lucide-react";
export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [keyword, setKeyword] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/users/admin/all");
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            alert("Không lấy được danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBlock = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn khóa tài khoản này?")) return;

        try {
            await axiosClient.put(`/users/admin/${userId}/block`);
            alert("Đã khóa tài khoản");
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert("Khóa tài khoản thất bại");
        }
    };

    const handleUnblock = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn mở khóa tài khoản này?")) return;

        try {
            await axiosClient.put(`/users/admin/${userId}/unblock`);
            alert("Đã mở khóa tài khoản");
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert("Mở khóa tài khoản thất bại");
        }
    };

    const openEditRoleModal = (user) => {
        setEditingUser(user);
        setSelectedRole(user.role_name || user.role || "user");
    };

    const handleSaveRole = async () => {
        try {
            const roleId = selectedRole === "admin" ? 1 : 2;

            await axiosClient.put(`/users/admin/${editingUser.user_id}/role`, {
                role_id: roleId,
            });

            alert("Cập nhật vai trò thành công");
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert("Cập nhật vai trò thất bại");
        }
    };

    const filteredUsers = users.filter((user) => {
        const text = `${user.full_name || ""} ${user.email || ""} ${user.phone || ""}`.toLowerCase();
        const matchKeyword = text.includes(keyword.toLowerCase());

        const userRole = user.role_name || user.role;
        const matchRole = roleFilter === "all" || userRole === roleFilter;

        const matchStatus =
            statusFilter === "all" || user.status === statusFilter;

        return matchKeyword && matchRole && matchStatus;
    });

    return (
        <>
            <div className="admin-topbar">
                <div>
                    <h1>Quản lý người dùng</h1>
                    <p>Khóa, mở khóa hoặc chỉnh sửa vai trò người dùng</p>
                </div>
            </div>

            <section className="admin-filter-bar">
                <input
                    placeholder="Tìm theo tên, email, số điện thoại..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="user">Người dùng</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="blocked">Đã khóa</option>
                </select>

                <button
                    type="button"
                    className="outline-btn"
                    onClick={() => {
                        setKeyword("");
                        setRoleFilter("all");
                        setStatusFilter("all");
                    }}
                >
                    Xóa lọc
                </button>
            </section>

            <section className="admin-panel large">
                {loading ? (
                    <p className="admin-empty">Đang tải dữ liệu...</p>
                ) : filteredUsers.length === 0 ? (
                    <p className="admin-empty">Không có người dùng phù hợp</p>
                ) : (
                    <div className="admin-table-scroll">
                    <div className="admin-user-table">
                        <div className="admin-user-head">
                            <span>ID</span>
                            <span>Họ tên</span>
                            <span>Email</span>
                            <span>SĐT</span>
                            <span>Vai trò</span>
                            <span>Trạng thái</span>
                            <span>Thao tác</span>
                        </div>

                        {filteredUsers.map((user) => (
                            <div className="admin-user-row" key={user.user_id}>
                                <span>{user.user_id}</span>
                                <span>{user.full_name}</span>
                                <span>{user.email}</span>
                                <span>{user.phone}</span>
                                <span>{user.role_name || user.role}</span>

                                <span className={`status-badge ${user.status}`}>
                                    {user.status === "active"
                                        ? "Hoạt động"
                                        : "Đã khóa"}
                                </span>

                                <div className="admin-icon-actions">
    <button
        className="icon-btn edit"
        title="Sửa vai trò"
        onClick={() => openEditRoleModal(user)}
    >
        <Pencil size={17} />
    </button>

    {user.status === "blocked" ? (
        <button
            className="icon-btn unlock"
            title="Mở khóa"
            onClick={() => handleUnblock(user.user_id)}
        >
            <Unlock size={17} />
        </button>
    ) : (
        <button
            className="icon-btn lock"
            title="Khóa"
            onClick={() => handleBlock(user.user_id)}
        >
            <Lock size={17} />
        </button>
    )}
</div>
                            </div>
                        ))}
                    </div>
                    </div>
                )}
            </section>

            {editingUser && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setEditingUser(null)}
                >
                    <div
                        className="admin-role-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="admin-modal-close"
                            onClick={() => setEditingUser(null)}
                        >
                            ×
                        </button>

                        <h2>Chỉnh sửa vai trò</h2>

                        <div className="admin-role-info">
                            <p>
                                <b>ID:</b> #{editingUser.user_id}
                            </p>
                            <p>
                                <b>Họ tên:</b> {editingUser.full_name}
                            </p>
                            <p>
                                <b>Email:</b> {editingUser.email}
                            </p>
                            <p>
                                <b>SĐT:</b> {editingUser.phone}
                            </p>
                            <p>
                                <b>Trạng thái:</b>{" "}
                                {editingUser.status === "active"
                                    ? "Hoạt động"
                                    : "Đã khóa"}
                            </p>
                        </div>

                        <label className="admin-role-label">Vai trò</label>

                        <select
                            className="admin-role-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="user">Người dùng</option>
                            <option value="admin">Quản trị viên</option>
                        </select>

                        <div className="admin-modal-actions">
                            <button
                                className="btn-save"
                                onClick={handleSaveRole}
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}