const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { poolPromise } = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const path = require("path");
const favoriteRoutes = require("./routes/favorite.routes");
const userRoutes = require("./routes/user.routes");
const followRoutes = require("./routes/follow.routes");
const commentRoutes = require("./routes/comment.routes");
const reviewRoutes = require("./routes/review.routes");
const notificationRoutes = require("./routes/notification.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/favorites", favoriteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);


app.get("/", async (req, res) => {
    try {
        await poolPromise;
        res.send("ChoXeMay API + SQL Server Connected");
    } catch (err) {
        res.status(500).send("Database Error");
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});