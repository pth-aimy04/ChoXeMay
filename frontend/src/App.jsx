import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Posts from "./pages/Posts";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/Notifications";
import SavedPosts from "./pages/SavedPosts";
import Messages from "./pages/Messages";
import ChatRoom from "./pages/ChatRoom";
import SellerPosts from "./pages/SellerPosts";

import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPosts from "./pages/AdminPosts";
import AdminUsers from "./pages/AdminUsers";
import AdminBrands from "./pages/AdminBrands";
import AdminModels from "./pages/AdminModels";
import AdminTypes from "./pages/AdminTypes";
import AdminNotifications from "./pages/AdminNotifications";
import AdminReports from "./pages/AdminReports";


function AppContent() {
    const location = useLocation();

    // Kiểm tra có phải trang admin không
    const isAdminPage = location.pathname.startsWith("/admin");

    return (
        <>
            {!isAdminPage && <Header />}

            <Routes>
                {/* User */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/seller-posts" element={<SellerPosts />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/edit-post/:id" element={<EditPost />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/favorites" element={<SavedPosts />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:conversation_id" element={<ChatRoom />} />

                {/* Admin */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="posts" element={<AdminPosts />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="brands" element={<AdminBrands />} />
                    <Route path="models" element={<AdminModels />} />
                    <Route path="vehicle-types" element={<AdminTypes />} />
                    <Route
                        path="notifications"
                        element={<AdminNotifications />}
                    />
                    <Route path="reports" element={<AdminReports />} />
                </Route>
            </Routes>

            {!isAdminPage && <Footer />}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;