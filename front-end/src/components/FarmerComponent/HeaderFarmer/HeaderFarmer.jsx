import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config.js";
import { isFarmer } from "../../../utils/roleCheck";
import { useToast } from "../../../context/ToastContext";
import { formatDate } from "../../../utils/formatDate.js";

export default function HeaderFarmer() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");
  const [avatar, setAvatar] = useState("");
  const token = localStorage.getItem("accessToken");
  useEffect(() => {
    if (!token) {
      navigate("/farmer/login");
    }

    //Kiểm tra có phải là customer hay không
    if (token) {
      const decodedToken = jwtDecode(token);
      setFullName(decodedToken?.fullname);
      setAvatar(decodedToken?.avatar);
      setUserId(decodedToken?.userid);
      if (!isFarmer(token)) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/farmer/login");
      }
    }
  }, [token, navigate]);

  //set toast khi logout
  const { setToastMessage } = useToast();

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/logout`);
      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setToastMessage("Đăng xuất thành công!");

        navigate("/farmer/login");
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

      // if (notification.notificationtype === "CreateNewOrder" || notification.notificationtype === "UpdateOrderStatus") {
      //   navigate("/purchase-history");
      // }
    } catch (error) {
      console.error("Error updating notification");
    }
  };

  return (
    <header className="z-40 p-3 bg-primary text-white px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 fixed top-0 w-full shadow-xl">
      <ToastContainer />
      <nav className="flex justify-between w-full m-auto py-2">
        <section className="flex flex-col sm:flex-row items-center">
          <h1 className="font-bold text-3xl sm:text-4xl mx-2 sm:mx-5">
            <Link to="/farmer">AgriMart</Link>
          </h1>
          <div className="text-2xl font-medium">
            <p className="">Kênh nhà nông dân</p>
          </div>
        </section>
        <section className="flex space-x-2 text-xl">
          <div className="relative inline-block text-left">
            <div
              className="flex items-center cursor-pointer mx-5 mt-2"
              onClick={openNotification}
            >
              <FontAwesomeIcon icon={faBell} />
              <p className="text-lg mx-2">Thông báo</p>
            </div>
            {isOpenNotification && (
              <div className="z-50 origin-top-right absolute right-5 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto overflow-x-hidden">
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
          <div className="flex items-center ml-3">
            <div className="relative inline-block text-left">
              <div
                className="cursor-pointer flex"
                onClick={() => setIsOpen(!isOpen)}
              >
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <p className="ml-2">{fullName}</p>
              </div>
              {isOpen && (
                <div className="z-40 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div
                    className="py-1"
                    style={{ zIndex: 9999 }}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <a
                      href="/farmer/profile"
                      className="block px-4 py-2 text-lg text-primary hover:bg-fourth hover:font-bold"
                      role="menuitem"
                    >
                      Thông tin cá nhân
                    </a>
                    <a
                      href="/farmer"
                      className="block px-4 py-2 text-lg text-primary hover:bg-fourth hover:font-bold"
                      role="menuitem"
                    >
                      Yêu cầu hỗ trợ
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-lg text-primary hover:bg-fourth hover:font-bold"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </nav>
    </header>
  );
}
