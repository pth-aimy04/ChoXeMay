import "../App.css";

export default function Footer() {
    return (
       <footer className="footer">
    <div className="footer-content">

        <div className="footer-left">
            <img
                src="/logo-choxemay.png"
                className="footer-logo"
                alt="ChoXeMay"
            />
        </div>

        <div className="footer-info">
            Nền tảng mua bán xe máy cũ uy tín,
            nhanh chóng và minh bạch.
        </div>

        <div className="footer-right">
            Hotline: 0765 320 892 <br />
            Email: support@choxemay.vn
        </div>

        <div className="footer-copy">
            © 2026 ChoXeMay.<br />
            Tất cả quyền được bảo lưu.
        </div>

    </div>
</footer>
    );
}