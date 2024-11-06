import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/config";
import { formatDate } from "../../../utils/formatDate";
import { toast } from "react-toastify";

export default function ShipperDetail({
  onClose,
  orderIdDetail,
  refreshOrders,
}) {
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderStatus, setOrderStatus] = useState(
    orderDetail?.orderStatus || ""
  );
  const [updateTime, setUpdateTime] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/shipper/orderdetail/${orderIdDetail}`
        );
        setOrderDetail(response.data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      }
    };

    fetchOrderDetail();
  }, [orderIdDetail]);

  const validStatuses = {
    "Đã tạo": ["Đã tạo", "Đã xác nhận", "Đã hủy"],
    "Đã xác nhận": ["Đã xác nhận", "Đang giao hàng", "Đã hủy"],
    "Đang giao hàng": ["Đang giao hàng", "Hoàn tất", "Đã hủy"],
    "Hoàn tất": ["Hoàn tất"],
    "Đã hủy": ["Đã hủy"],
  };

  const getValidStatuses = (currentStatus) =>
    validStatuses[currentStatus] || [];

  const onChangeStatus = async (orderId, orderStatus) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/distributor/order-update`,
        { orderId, status: orderStatus }
      );
      setUpdateTime(response.data.updateTime);
      onClose();
      toast.success(response.data.message);
      refreshOrders();
    } catch (error) {
      console.error("Failed to update status: ", error);
      toast.error(error.response.data.message);
    }
  };

  const isDisabled =
    orderDetail?.orderStatus === orderStatus ||
    orderDetail?.orderStatus === "Đã hủy" ||
    orderDetail?.orderStatus === "Hoàn tất";
  const selectDisabled =
    orderDetail?.orderStatus === "Đã hủy" ||
    orderDetail?.orderStatus === "Hoàn tất";

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-8/12 lg:w-6/12 xl:w-5/12 p-6 relative">
        <button
          onClick={onClose}
          className="absolute  hover:bg-primary hover:px-2 px-2  top-3 right-3 text-gray-600 hover:text-gray-800 text-3xl"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className="text-2xl font-semibold text-center text-primary mb-6">
          Chi tiết đơn hàng
        </h2>

        <div className="space-y-4">
          {[
            ["Mã đơn hàng:", orderDetail?.orderid.slice(0, 8)],
            ["Tên khách hàng:", orderDetail?.customer_name],
            ["Số điện thoại:", orderDetail?.customer_phone],
            ["Địa chỉ giao hàng:", orderDetail?.shippingaddress],
            ["Tổng tiền:", `${orderDetail?.totalamount} đ`],
            ["Ngày tạo đơn:", formatDate(orderDetail?.ordercreatetime)],
            [
              "Ngày cập nhật:",
              formatDate(updateTime || orderDetail?.orderupdatetime),
            ],
          ].map(([label, value]) => (
            <div
              className="flex justify-between items-center text-lg"
              key={label}
            >
              <p className="font-medium w-1/3">{label}</p>
              <p className="w-2/3">{value}</p>
            </div>
          ))}

          <div className="flex items-center text-lg">
            <p className="font-medium w-1/3">Trạng thái đơn h:</p>
            <div className="w-2/3 flex items-center space-x-2">
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="bg-gray-100 border border-gray-300 rounded p-2"
                disabled={selectDisabled}
              >
                {getValidStatuses(orderDetail?.orderstatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  !isDisabled && onChangeStatus(orderIdDetail, orderStatus)
                }
                disabled={isDisabled}
                className={`px-4 py-2 font-bold rounded ${
                  isDisabled
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                Thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ShipperDetail.propTypes = {
  onClose: PropTypes.func.isRequired,
  orderIdDetail: PropTypes.string.isRequired,
  refreshOrders: PropTypes.func.isRequired,
};
