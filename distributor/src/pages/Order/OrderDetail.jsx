import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import PropTypes from "prop-types";
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
  const [selectedShipper, setSelectedShipper] = useState(null);

  useEffect(() => {
    const fetchShippers = async () => {
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
  }, [orderIdDetail]);

  const onUpdateShipper = async (orderId, shipperId) => {
    if (orderDetail?.orderStatus !== "Đã tạo") {
      toast.error(
        "Chỉ có thể cập nhật shipper khi đơn hàng đang ở trạng thái 'Đã tạo'"
      );
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/order/shipper-update`, {
        orderId,
        shipperId,
      });
      toast.success(response.data.message);
      onClose();
      refreshOrders();
    } catch (error) {
      console.error("Failed to update shipper: ", error);
      toast.error("Cập nhật shipper thất bại");
    }
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/farmer/order/${orderIdDetail}`
        );
        setOrderDetail(response.data);
        setSelectedShipper(response.data.shipperId); // Thiết lập shipper đã chọn
      } catch (error) {
        console.error("Failed to fetch order detail: ", error);
      }
    };

    fetchOrderDetail();
  }, [orderIdDetail]);

  const handleShipperChange = (event) => {
    setSelectedShipper(event.target.value);
  };

  const isOrderEditable = orderDetail?.orderStatus === "Đã tạo"; // Kiểm tra trạng thái đơn hàng

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
              <p className="text-lg w-3/4">{orderDetail?.user?.fullName}</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Email:</p>
              <p className="text-lg w-3/4">{orderDetail?.user?.email}</p>
            </div>
            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Số điện thoại:</p>
              <p className="text-lg w-3/4">{orderDetail?.user?.phonenumber}</p>
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
            <div className="border border-primary my-3"></div>

            <div className="flex flex-col my-2">
              <div className="font-bold text-xl my-3 mx-3">
                Danh sách các sản phẩm:
              </div>
              <ul>
                {orderDetail?.items?.length > 0 ? (
                  orderDetail.items.map((item, index) => (
                    <li key={index} className="flex items-center text-center hover:bg-fourth rounded-sm">
                      <p className="text-lg w-3/12 mx-5 font-medium">
                        {item.productName}
                      </p>
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-28 w-40"
                      />
                      <p className="text-xl mx-5 font-medium">
                        {Number(item.price).toLocaleString("vi-VN")}
                      </p>
                      <p className="text-xl mx-5 font-medium">
                        {item.quantity}
                      </p>
                    </li>
                  ))
                ) : (
                  <p>Không có sản phẩm nào trong đơn hàng.</p>
                )}
              </ul>
            </div>
            <div className="border border-primary my-3"></div>

            <div className="flex my-2">
              <p className="font-bold text-xl w-1/4 mx-3">Tổng tiền:</p>
              <p className="text-lg w-3/4">
                {Number(orderDetail?.totalAmount).toLocaleString("vi-VN")} đ
              </p>
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
              <p className="font-bold text-xl w-1/4 mx-3">Chọn người giao hàng:</p>
              <div className="text-lg w-3/4">
                <select
                  value={selectedShipper || ""}
                  onChange={handleShipperChange}
                  className="mr-1"
                  disabled={!isOrderEditable} 
                >
                  <option value="" disabled>
                    {selectedShipper ? "Chọn shipper" : "Chưa có shipper"}
                  </option>
                  {shippers.map((shipper) => (
                    <option key={shipper.userid} value={shipper.userid}>
                      {shipper.fullname}
                    </option>
                  ))}
                </select>
                <button
                  className={`ml-3 font-bold ${
                    !selectedShipper || !isOrderEditable
                      ? "cursor-not-allowed opacity-90"
                      : ""
                  }`}
                  onClick={() =>
                    onUpdateShipper(orderIdDetail, selectedShipper)
                  }
                  disabled={!selectedShipper || !isOrderEditable}
                >
                  Cập nhật Shipper
                </button>
              </div>
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
