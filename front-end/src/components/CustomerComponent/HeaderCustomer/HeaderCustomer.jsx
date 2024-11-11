import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCamera,
  faCartPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import "../../../App.css";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../../config/config";
import { isCustomer } from "../../../utils/roleCheck";
import { useToast } from "../../../context/ToastContext";
import SearchImageDialog from "../../../pages/Customer/SearchByImage/SearchImageDialog.jsx";
import { formatDate } from "./../../../utils/formatDate";

export default function HeaderCustomer() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");
  const { setToastMessage } = useToast();
  const token = localStorage.getItem("accessToken");
  const [userId, setUserId] = useState("");
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setFullName(decodedToken?.fullname);
      setAvatar(decodedToken?.avatar);
      setUserId(decodedToken?.userid);
      //Kiểm tra có phải là customer hay không
      if (!isCustomer(token)) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  }, [token, navigate]);

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/logout`);
      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setToastMessage("Đăng xuất thành công!");

        navigate("/login");
        // console.log(response);
      } else {
        toast.error("Đăng xuất thất bại. Vui lòng thử lại.", {
          position: "top-right",
          time: 500,
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error(error, {
        position: "top-right",
        time: 500,
      });
    } 
  };

  const handleCartClick = () => {
    token ? navigate("/cart") : navigate("/login");
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { search: query.trim() },
      });
      const data = response.data;
      navigate(`/search?query=${encodeURIComponent(query.trim())}`, {
        state: { productSearch: data },
      });
      setQuery("");
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  const handleRouteToLoginFarmer = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/logout`);
      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/farmer/login");
      } else {
        toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error(error, {
        position: "top-right",
        time: 500,
      });
    } 
  };

  const handleRouteToRegisterFarmer = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/logout`);
      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/farmer/register/step1");
      } else {
        toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error(error, {
        position: "top-right",
        time: 500,
      });
    } 
  };

  //Search Image
  const [isSearchImageDialogOpen, setIsSearchImageDialogOpen] = useState(false);
  const openSearchImageDialog = () => {
    setIsSearchImageDialogOpen(true);
  };

  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const openNotification = async () => {
    setIsOpenNotification(!isOpenNotification);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-notification-user/${userId}`
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error getting notifications:", error);
    }
  };

  const handleNotificationClick = (notification) => async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/update-notification/${notification.notificationid}`
      );
      const updatedNotification = response.data;
      const updatedNotifications = notifications.map((notification) =>
        notification.notificationid === notification.notificationid
          ? { ...notification, is_read: updatedNotification.is_read }
          : notification
      );
      setNotifications(updatedNotifications);

      if (notification.notificationtype === "CreateNewOrder" || notification.notificationtype === "UpdateOrderStatus") {
        navigate("/purchase-history");
      }
    } catch (error) {
      console.error("Error updating notification");
    }
  };

  return (
    <header className="p-4 bg-primary text-white px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 fixed top-0 w-full z-40 shadow-2xl">
      <ToastContainer />
      
      <nav className="flex flex-col w-4/5 m-auto sm:flex-row justify-between items-center">
        <section className="flex space-x-2 sm:space-x-4">
          <p
            className="cursor-pointer mx-1 sm:mx-2"
            onClick={handleRouteToLoginFarmer}
          >
            Kênh người nông dân
          </p>
          <p
            className="cursor-pointer mx-1 sm:mx-2"
            onClick={handleRouteToRegisterFarmer}
          >
            Trở thành người nông dân
          </p>
        </section>
        <section className="flex space-x-2 sm:space-x-4 mt-2 sm:mt-4">
          <div className="relative inline-block text-left">
            <div
              className="flex items-center space-x-1 sm:space-x-2 cursor-pointer mx-1 sm:mx-2"
              onClick={openNotification}
            >
              <FontAwesomeIcon icon={faBell} />
              <p>Thông báo</p>
            </div>
            {isOpenNotification && (
              <div className="z-50 origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto overflow-x-hidden">
                <div
                  className="py-1"
                  style={{ zIndex: 9999 }}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  {notifications.length === 0 ? (
                    <div className="flex flex-col px-4 py-2 text-sm text-primary cursor-pointer min-w-80">
                      <div className="p-4 border rounded-lg shadow-md bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-bold text-lg text-primary">
                            Không có thông báo nào
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.notificationid}
                        className="flex flex-col px-4 py-2 text-sm text-primary cursor-pointer min-w-80"
                        onClick={handleNotificationClick(notification)}
                      >
                        <div
                          className={`p-4 border rounded-lg shadow-md ${
                            notification.is_read ? "bg-white" : "bg-fourth"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-bold text-lg text-primary">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                          <p className="text-gray-700">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-1 sm:space-x-2">
            {fullName ? (
              <div className="relative inline-block text-left">
                <div
                  className="flex cursor-pointer "
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-7 h-7 rounded-full"
                  />
                  <p className="mx-1 sm:mx-2">{fullName}</p>
                </div>

                {isOpen && (
                  <div className="z-50 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div
                      className="py-1"
                      style={{ zIndex: 9999 }}
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <Link
                        to="/detail-info"
                        className="block px-4 py-2 text-sm text-primary hover:bg-fourth hover:font-bold"
                        role="menuitem"
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/purchase-history"
                        className="block px-4 py-2 text-sm text-primary hover:bg-fourth hover:font-bold"
                        role="menuitem"
                      >
                        Lịch sử mua hàng
                      </Link>
                      <Link
                        className="block px-4 py-2 text-sm text-primary hover:bg-fourth hover:font-bold"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <p className="cursor-pointer mx-1 sm:mx-2">Đăng nhập</p>
                </Link>
                <Link to="/register/step1">
                  <p className="cursor-pointer mx-1 sm:mx-2">Đăng ký</p>
                </Link>
              </>
            )}
          </div>
        </section>
      </nav>
      <section className="w-4/5 m-auto flex flex-col sm:flex-row justify-between items-center space-x-2 sm:space-x-4 mt-2 sm:mt-4">
        <h1 className="font-bold text-2xl sm:text-4xl mx-2 sm:mx-5">
          <Link to="/">AgriMart</Link>
        </h1>
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu và cửa hàng"
            className="w-full p-2 sm:p-3 border rounded-sm placeholder-color pr-5 sm:pr-10 text-primary"
            style={{ zIndex: 500 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 px-2 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded-lg "
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <div className="border border-white rounded">
          <button
            className="p-1 sm:p-2 text-white rounded text-2xl sm:text-4xl mt-2 sm:mt-0 hover:bg-white hover:text-primary"
            onClick={() => openSearchImageDialog()}
          >
            <FontAwesomeIcon icon={faCamera} size="1x" />
          </button>
        </div>
        <button
          className="p-1 sm:p-2 text-white text-2xl sm:text-4xl mt-2 sm:mt-0 hover:bg-white hover:text-primary rounded-full"
          onClick={handleCartClick}
        >
          <FontAwesomeIcon icon={faCartPlus} size="1x" />
        </button>
      </section>
      {isSearchImageDialogOpen && (
        <SearchImageDialog onClose={() => setIsSearchImageDialogOpen(false)} />
      )}
    </header>
  );
}
