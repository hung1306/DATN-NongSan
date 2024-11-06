import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { PropTypes } from "prop-types";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/config";
import { formatDate } from "../../utils/formatDate";
import { toast } from "react-toastify";

export default function FarmerOrderDetail({
  onClose,
  orderIdDetail,
  refreshOrders,
}) {
  const [orderDetail, setOrderDetail] = useState(null);

  const [shippers, setShippers] = useState([]);
  const [selectedShipper, setSelectedShipper] = useState("");

  useEffect(() => {
    // const extractDeliveryArea = (address) => {
    //   const match = address.match(/Quận\s+\d+/);
    //   return match ? match[0] : null;
    // };

    const fetchShippers = async () => {
      // const deliveryArea = extractDeliveryArea(orderDetail?.deliveryAddress);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/shipper/deliveryArea/${orderIdDetail}`
        );
        setShippers(response.data.shippers);
      } catch (error) {
        console.error("Failed to fetch shippers: ", error);
      }
    };

    fetchShippers();
  }, [orderDetail]);

  const onUpdateShipper = async (orderId, shipperId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/order/shipper-update`, {
        orderId: orderId,
        shipperId: shipperId,
      });
      toast.success(response.data.message);
      onClose();
      refreshOrders();
    } catch (error) {
      console.log("Failed to update shipper: ", error);
      toast.error("Cập nhật shipper thất bại");
    }
  };

  // const validStatuses = {
  //   "Đã tạo": ["Đã tạo", "Đã xác nhận", "Đã hủy"],
  //   "Đã xác nhận": ["Đã xác nhận", "Đang giao hàng", "Đã hủy"],
  //   "Đang giao hàng": ["Đang giao hàng", "Hoàn tất", "Đã hủy"],
  //   "Hoàn tất": ["Hoàn tất"],
  //   "Đã hủy": ["Đã hủy"],
  // };

  // const getValidStatuses = (currentStatus) => {
  //   return validStatuses[currentStatus] || [];
  // };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/farmer/order/${orderIdDetail}`
        );
        setOrderDetail(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrderDetail();
  }, [orderIdDetail]);

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-6 rounded-lg w-5/12 m-auto text-primary h-3/4 overflow-auto shadow-xl border border-primary">
        <div className="flex justify-end">
          <button
            className="text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-3xl text-center font-bold">Chi tiết đơn hàng</h2>
        <div className="border border-primary mt-2"></div>

        <div className="py-4">
          <div className="flex flex-col">
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Tên khách hàng:</p>
              <p className="text-lg w-3/4">{orderDetail?.user.fullName}</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Email:</p>
              <p className="text-lg w-3/4">{orderDetail?.user.email}</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Số điện thoại:</p>
              <p className="text-lg w-3/4">{orderDetail?.user.phonenumber}</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Địa chỉ giao hàng:</p>
              <p className="text-lg w-3/4">{orderDetail?.deliveryAddress}</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Ngày tạo đơn hàng:</p>
              <p className="text-lg w-3/4">
                {formatDate(orderDetail?.orderCreateTime)}
              </p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">
                Trạng thái đơn hàng:
              </p>
              <p className="text-lg w-3/4">{orderDetail?.orderStatus}</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Ngày cập nhật:</p>
              <p className="text-lg w-3/4">
                {formatDate(orderDetail?.orderUpdateTime)}
              </p>
            </div>
            <div className="border border-primary"></div>
            <div className="flex flex-col my-2">
              <div className="font-bold text-xl my-3 mx-3">
                Danh sách sản phẩm:
              </div>
              <div className="">
                <ul>
                  {orderDetail?.items?.length > 0 ? (
                    orderDetail.items.map((item, index) => (
                      <li key={index} className="flex items-center text-center">
                        <p className="text-lg w-3/12 mx-5 font-medium">
                          {item.productName}
                        </p>
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-28 w-40"
                        />
                        <p className="text-xl mx-5 font-medium">
                          {Number(item.price.toLocaleString("vi-VN"))}đ
                        </p>
                        <p className="text-xl mx-5 font-medium">
                          {item.quantity}
                        </p>
                      </li>
                    ))
                  ) : (
                    <p>No order items available.</p>
                  )}
                </ul>
              </div>
              <div className="border border-primary my-3"></div>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Tổng tiền:</p>
              <p className="text-lg w-3/4">{orderDetail?.totalAmount} đ</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">
                Phương thức thanh toán:
              </p>
              <p className="text-lg w-3/4">{orderDetail?.paymentMethod}</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">
                Trạng thái thanh toán:
              </p>
              <p className="text-lg w-3/4">{orderDetail?.paymentStatus}</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Chọn shipper:</p>
              <p className="text-lg w-3/4">
                <select
                  value={selectedShipper}
                  onChange={(e) => setSelectedShipper(e.target.value)}
                  className="mr-1"
                >
                  <option value="">--Chọn shipper--</option>
                  {shippers.map((shipper) => (
                    <option key={shipper.userid} value={shipper.userid}>
                      {shipper.username}
                    </option>
                  ))}
                </select>
                <button
                  className="ml-3 font-bold cursor-pointer"
                  onClick={() =>
                    onUpdateShipper(orderIdDetail, selectedShipper)
                  }
                  disabled={!selectedShipper}
                >
                  Cập nhật Shipper
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

FarmerOrderDetail.propTypes = {
  onClose: PropTypes.func.isRequired,
  orderIdDetail: PropTypes.string.isRequired,
  refreshOrders: PropTypes.func.isRequired,
};
