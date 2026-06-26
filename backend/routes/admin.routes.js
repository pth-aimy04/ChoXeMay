const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

const {
    getDashboardStats,

    getAllUsers,
    blockUser,
    unblockUser,

    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand,

    getAllModels,
    createModel,
    updateModel,
    deleteModel,

    getAllVehicleTypes,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,

    getAllNotifications,
    createNotificationForUser,
    createNotificationForAllUsers,
    deleteNotification,

    getReportOverview,
    getReportPostsByBrand,
    getReportPostsByType,
    getReportPostsByStatus,
    getReportTopViewedPosts,

    getTopViewedPosts,
    getTopSellersByRating,
    getTopSellersByFollowers,
    getPostsByBrand
} = require("../controllers/admin.controller");

router.get("/dashboard", verifyToken, isAdmin, getDashboardStats);

router.get("/users", verifyToken, isAdmin, getAllUsers);
router.put("/users/:id/block", verifyToken, isAdmin, blockUser);
router.put("/users/:id/unblock", verifyToken, isAdmin, unblockUser);

// Hãng xe
router.get("/brands", verifyToken, isAdmin, getAllBrands);
router.post("/brands", verifyToken, isAdmin, createBrand);
router.put("/brands/:id", verifyToken, isAdmin, updateBrand);
router.delete("/brands/:id", verifyToken, isAdmin, deleteBrand);

// Dòng xe
router.get("/models", verifyToken, isAdmin, getAllModels);
router.post("/models", verifyToken, isAdmin, createModel);
router.put("/models/:id", verifyToken, isAdmin, updateModel);
router.delete("/models/:id", verifyToken, isAdmin, deleteModel);

// Loại xe
router.get("/vehicle-types", verifyToken, isAdmin, getAllVehicleTypes);
router.post("/vehicle-types", verifyToken, isAdmin, createVehicleType);
router.put("/vehicle-types/:id", verifyToken, isAdmin, updateVehicleType);
router.delete("/vehicle-types/:id", verifyToken, isAdmin, deleteVehicleType);

//thông báo
router.get("/notifications", verifyToken, isAdmin, getAllNotifications);
router.post("/notifications/user",verifyToken,isAdmin,createNotificationForUser);
router.post("/notifications/all",verifyToken,isAdmin,createNotificationForAllUsers);
router.delete("/notifications/:id",verifyToken,isAdmin,deleteNotification);

//thống kê
router.get("/top-viewed-posts", verifyToken, isAdmin, getTopViewedPosts);
router.get("/top-sellers-rating", verifyToken, isAdmin, getTopSellersByRating);
router.get("/top-sellers-followers", verifyToken, isAdmin, getTopSellersByFollowers);
router.get("/posts-by-brand", verifyToken, isAdmin, getPostsByBrand);

//báo cáo
router.get("/reports/overview", verifyToken, isAdmin, getReportOverview);
router.get("/reports/posts-by-brand", verifyToken, isAdmin, getReportPostsByBrand);
router.get("/reports/posts-by-type", verifyToken, isAdmin, getReportPostsByType);
router.get("/reports/posts-by-status", verifyToken, isAdmin, getReportPostsByStatus);
router.get("/reports/top-viewed-posts", verifyToken, isAdmin, getReportTopViewedPosts);

module.exports = router;