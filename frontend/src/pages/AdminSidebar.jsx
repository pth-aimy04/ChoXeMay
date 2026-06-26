import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FileText,
    Tags,
    Bike,
    List,
    Bell,
    BarChart3
} from "lucide-react";

export default function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
    <img
        src="/logo-choxemay.png"
        alt="ChoXeMay"
        className="admin-logo"
    />
</div>
            <nav>
                <NavLink to="/admin" end>
                    <LayoutDashboard size={18} /> Dashboard
                </NavLink>

                <NavLink to="/admin/users">
                    <Users size={18} /> Người dùng
                </NavLink>

                <NavLink to="/admin/posts">
                    <FileText size={18} /> Tin đăng
                </NavLink>

                <NavLink to="/admin/brands">
                    <Tags size={18} /> Hãng xe
                </NavLink>

                <NavLink to="/admin/models">
                    <Bike size={18} /> Dòng xe
                </NavLink>

                <NavLink to="/admin/vehicle-types">
                    <List size={18} /> Loại xe
                </NavLink>

                <NavLink to="/admin/notifications">
                    <Bell size={18} /> Thông báo
                </NavLink>

                <NavLink to="/admin/reports">
                    <BarChart3 size={18} /> Báo cáo
                </NavLink>
            </nav>

            <div className="admin-user-box">
                <div className="admin-avatar">A</div>
                <div>
                    <strong>Admin</strong>
                    <span>Quản trị viên</span>
                </div>
            </div>
        </aside>
    );
}