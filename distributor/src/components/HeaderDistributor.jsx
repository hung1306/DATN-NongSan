import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function HeaderDistributor() {
  const navigate = useNavigate();
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

  return (
    <header className="py-4 bg-primary text-white px-4 sm:px-6 lg:px-16 fixed top-0 w-full z-40 shadow-md">
      <nav className="flex flex-wrap items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="font-bold text-2xl sm:text-3xl">
            <Link to="/" className="hover:text-secondary">
              AgriMart
            </Link>
          </h1>
          <span className="text-lg hidden sm:inline font-medium">
            Kênh nhà phân phối
          </span>
        </div>

        <div className="flex flex-wrap items-center space-x-3 sm:space-x-5">
          <Link
            to="/"
            className="text-white hover:bg-white hover:text-primary font-medium px-2 py-1 rounded-lg transition duration-150"
          >
            Trang chủ
          </Link>
          <Link
            to="/farmer"
            className="text-white hover:bg-white hover:text-primary font-medium px-2 py-1 rounded-lg transition duration-150"
          >
            Nông dân
          </Link>
          <Link
            to="/shipper"
            className="text-white hover:bg-white hover:text-primary font-medium px-2 py-1 rounded-lg transition duration-150"
          >
            Người giao hàng
          </Link>
          <Link
            to="/category"
            className="text-white hover:bg-white hover:text-primary font-medium px-2 py-1 rounded-lg transition duration-150"
          >
            Danh mục
          </Link>
          <Link
            to="/product"
            className="text-white hover:bg-white hover:text-primary font-medium px-2 py-1 rounded-lg transition duration-150"
          >
            Sản phẩm
          </Link>
          <Link
            to="/order"
            className="text-white hover:bg-white hover:text-primary font-medium px-2 py-1 rounded-lg transition duration-150"
          >
            Đơn hàng
          </Link>
          <Link
            to="/notification"
            className="text-white hover:bg-white hover:text-primary font-medium px-2 py-1 rounded-lg transition duration-150"
          >
            Thông báo
          </Link>
          <button
            onClick={onLogout}
            className=" hover:bg-white hover:text-primary text-white font-medium px-3 py-2 rounded-lg transition duration-150"
          >
            Đăng xuất
          </button>
        </div>
      </nav>
    </header>
  );
}
