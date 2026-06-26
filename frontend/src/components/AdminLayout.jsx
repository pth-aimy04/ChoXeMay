import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../pages/AdminSidebar";

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const toggleSidebar = () => {
            setSidebarOpen((prev) => !prev);
        };

        window.addEventListener("toggle-admin-sidebar", toggleSidebar);

        return () => {
            window.removeEventListener("toggle-admin-sidebar", toggleSidebar);
        };
    }, []);

    return (
        <main className={`admin-shell ${sidebarOpen ? "" : "sidebar-closed"}`}>
            <AdminSidebar />

            <section className="admin-main">
                <Outlet />
            </section>
        </main>
    );
}