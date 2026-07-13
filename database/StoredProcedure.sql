-- Tổng quan hệ thống
CREATE OR ALTER PROCEDURE sp_AdminReportOverview
AS
BEGIN
    SELECT
        (SELECT COUNT(*) FROM Users) AS total_users,
        (SELECT COUNT(*) FROM Posts) AS total_posts,
        (SELECT COUNT(*) FROM Posts WHERE status = 'pending') AS pending_posts,
        (SELECT COUNT(*) FROM Posts WHERE status = 'approved') AS approved_posts,
        (SELECT COUNT(*) FROM Posts WHERE status = 'rejected') AS rejected_posts,
        (SELECT COUNT(*) FROM Favorites) AS total_favorites,
        (SELECT COUNT(*) FROM Comments) AS total_comments,
        (SELECT COUNT(*) FROM Follows) AS total_follows,
        (SELECT ISNULL(SUM(price), 0) FROM Posts WHERE status = 'approved') AS total_post_value;
END;
GO

-- Số tin theo hãng xe
CREATE OR ALTER PROCEDURE sp_AdminPostsByBrand
AS
BEGIN
    SELECT 
        b.brand_name,
        COUNT(p.post_id) AS total_posts
    FROM Brands b
    LEFT JOIN Posts p ON b.brand_id = p.brand_id
    GROUP BY b.brand_name
    ORDER BY total_posts DESC;
END;
GO

-- Số tin theo loại xe
CREATE OR ALTER PROCEDURE sp_AdminPostsByType
AS
BEGIN
    SELECT 
        vt.type_name,
        COUNT(p.post_id) AS total_posts
    FROM VehicleTypes vt
    LEFT JOIN Posts p ON vt.type_id = p.type_id
    GROUP BY vt.type_name
    ORDER BY total_posts DESC;
END;
GO
-- Tỉ lệ tin theo trạng thái
CREATE OR ALTER PROCEDURE sp_AdminPostsByStatus
AS
BEGIN
    SELECT 
        status,
        COUNT(*) AS total_posts
    FROM Posts
    GROUP BY status;
END;
GO
-- Top tin được xem nhiều
CREATE OR ALTER PROCEDURE sp_AdminTopViewedPosts
AS
BEGIN
    SELECT TOP 10
        p.post_id,
        p.title,
        p.view_count,
        b.brand_name,
        m.model_name
    FROM Posts p
    JOIN Brands b ON p.brand_id = b.brand_id
    LEFT JOIN Models m ON p.model_id = m.model_id
    ORDER BY p.view_count DESC;
END;
GO