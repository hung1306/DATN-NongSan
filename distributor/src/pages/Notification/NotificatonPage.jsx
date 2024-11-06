import { useEffect, useState } from "react";
import HeaderDistributor from "../../components/HeaderDistributor";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { formatDate } from "./../../utils/formatDate";

export default function NotificatonPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
    // giải mã token lấy distributorid
    const decodedToken = jwtDecode(token);
    const distributorid = decodedToken.distributorid;
    // gọi api lấy thông báo
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get-notification-distributor/${distributorid}`
        );
        const data = await response.data;
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [navigate, token]);

  const onNotificationClick = async (notificationid) => {
    try {
      // Lấy thông báo theo id
      const response = await axios.get(
        `${API_BASE_URL}/get-notification/${notificationid}`
      );
      const notification = response.data;

      // Nếu thông báo chưa đọc thì gọi api update thông báo
      if (!notification.is_read) {
        await axios.put(
          `${API_BASE_URL}/update-notification/${notificationid}`
        );
        const updatedNotifications = notifications.map((notification) => {
          if (notification.notificationid === notificationid) {
            return { ...notification, is_read: true };
          }
          return notification;
        });
        setNotifications(updatedNotifications);
      }

      //Kiểm tra loại thông báo
      if (
        notification.notificationtype === "CreateNewProduct" ||
        notification.notificationtype === "BatchExpired"
      ) {
        navigate("/product");
      } else if (notification.notificationtype === "CreateNewOrder") {
        navigate("/order");
      } else if (notification.notificationtype === "CreateNewFarmer") {
        navigate("/farmer");
      } else if (notification.notificationtype === "CreateNewShipper") {
        navigate("/shipper");
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  return (
    <div>
      <HeaderDistributor />
      <div className="container mx-auto mt-28">
        <h1 className="text-3xl font-bold text-center text-primary">
          Tất cả thông báo
        </h1>
        <div className="mt-7 w-2/3 m-auto">
          {notifications.map((notification) => (
            <div
              key={notification.notificationid}
              className={`p-3 my-3 border-2 border-primary text-primary rounded shadow-2xl ${
                notification.is_read ? "bg-white" : "bg-fourth hover:opacity-80"
              } cursor-pointer`}
              onClick={() => onNotificationClick(notification.notificationid)}
            >
              <div className="flex">
                <h2 className="font-bold text-xl my-1">{notification.title}</h2>
                <p className="text-xs font-thin italic ml-3 my-2">
                  {formatDate(notification.created_at)}
                </p>
              </div>
              <p className="my-1 font-medium">{notification.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
