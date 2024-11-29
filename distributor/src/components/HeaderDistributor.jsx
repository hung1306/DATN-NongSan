import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function HeaderDistributor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToastMessage } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const onLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setToastMessage("Đăng xuất thành công");
  };

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "bg-white text-primary font-medium px-2 py-1 rounded-lg transition duration-150"
      : "text-white font-medium px-2 py-1 rounded-lg transition duration-150";
  };

  return (
    <header className="bg-primary text-white p-5 sm:px-6 lg:px-16 fixed top-0 w-full z-40 shadow-md">
      <nav className="flex flex-wrap items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="font-bold text-3xl sm:text-3xl">
            <Link to="/" className="hover:text-fourth">
              AgriMart
            </Link>
          </h1>
          <span className="text-lg hidden sm:inline font-medium mb-3">
            Kênh nhà phân phối
          </span>
        </div>

        <div className="flex flex-wrap items-center">
          <Link to="/" className={getLinkClass("/")}>
            Trang chủ
          </Link>
          <Link to="/farmer" className={getLinkClass("/farmer")}>
            Nông dân
          </Link>
          <Link to="/shipper" className={getLinkClass("/shipper")}>
            Người giao hàng
          </Link>
          <Link to="/category" className={getLinkClass("/category")}>
            Danh mục
          </Link>
          <Link to="/product" className={getLinkClass("/product")}>
            Sản phẩm
          </Link>
          <Link to="/order" className={getLinkClass("/order")}>
            Đơn hàng
          </Link>
          <Link to="/notification" className={getLinkClass("/notification")}>
            Thông báo
          </Link>
          <button
            onClick={onLogout}
            className="text-white font-medium px-3 py-2 rounded-lg transition duration-150"
          >
            Đăng xuất
          </button>
        </div>
      </nav>
    </header>
  );
}
