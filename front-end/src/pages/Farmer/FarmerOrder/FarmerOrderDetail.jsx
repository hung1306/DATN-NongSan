import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { PropTypes } from "prop-types";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/config";
import { formatDate } from "../../../utils/formatDate";
import { truncateText } from "../../../utils/truncaseText";
import { toast } from "react-toastify";

export default function FarmerOrderDetail({ onClose, orderIdDetail, refreshOrders }) {
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderStatus, setOrderStatus] = useState(orderDetail?.orderStatus);
  const [updateTime, setUpdateTime] = useState(null);
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/farmer/order/${orderIdDetail}`
        );
        setOrderDetail(response.data);
        setOrderStatus(response.data.orderStatus);
        setUpdateTime(response.data.updateTime);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrderDetail();
  }, [orderIdDetail]);

  const onChangeStatus = async (orderId, orderStatus) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/farmer/order-update`, {
        orderId: orderId,
        status: orderStatus,
      });
      setUpdateTime(response.data.updateTime);
      onClose();
      refreshOrders()
      toast.success(response.data.message);
    } catch (error) {
      console.log("Failed to update status: ", error);
    }
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-6 rounded-lg w-1/2 m-auto text-primary h-3/4 overflow-auto shadow-xl border border-primary">
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
              <p className="font-medium text-xl w-1/4 mr-3">Tên khách hàng:</p>
              <p className="text-lg w-3/4">{orderDetail?.user.fullName}</p>
            </div>
            <div className="flex my-2">
              <p className="font-medium text-xl w-1/4 mr-3">Email:</p>
              <p className="text-lg w-3/4">{orderDetail?.user.email}</p>
            </div>
            <div className="flex my-2">
              <p className="font-medium text-xl w-1/4 mr-3">Email:</p>
              <p className="text-lg w-3/4">{orderDetail?.user.phonenumber}</p>
            </div>
            <div className="flex my-2">
              <p className="font-medium text-xl w-1/4 mr-3">
                Địa chỉ giao hàng:
              </p>
              <p className="text-lg w-3/4">{orderDetail?.deliveryAddress}</p>
            </div>
            <div className="flex my-2">
              <p className="font-medium text-xl w-1/4 mr-3">
                Ngày tạo đơn hàng:
              </p>
              <p className="text-lg w-3/4">
                {formatDate(orderDetail?.orderCreateTime)}
              </p>
            </div>
            <div className="flex my-2">
              <p className="font-medium text-xl w-1/4 mr-3">
                Trạng thái đơn hàng:
              </p>
              <p className="text-lg w-3/4">
                {/* {orderDetail?.orderStatus} */}
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="mr-1"
                >
                  <option value="Đã tạo">Đã tạo</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đang giao hàng">Đang giao hàng</option>
                  <option value="Đã giao hàng">Đã giao hàng</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>

                <a
                  className="font-medium cursor-pointer"
                  onClick={() => onChangeStatus(orderIdDetail, orderStatus)}
                >
                  Thay đổi
                </a>
              </p>
            </div>
            <div className="flex my-2">
              <p className="font-medium text-xl w-1/4 mr-3">Ngày cập nhật:</p>
              <p className="text-lg w-3/4">
                {updateTime
                  ? formatDate(updateTime)
                  : formatDate(orderDetail?.orderUpdateTime)}
              </p>
            </div>
            <div className="border border-primary"></div>
            <div className="flex flex-col my-2">
              <div className="font-medium text-xl my-2">
                Danh sách sản phẩm:
              </div>
              <div className="">
                <ul>
                  
                  {orderDetail?.items?.length > 0 ? (
                    orderDetail.items.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between text-center"
                      >
                        <p className="text-lg w-1/12">{item.productName}</p>
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-24 w-1/6"
                        />
                        <p className="text-lg ml-3 text-justify w-1/2">
                          {truncateText(item.overviewdes, 150)}{" "}
                        </p>
                        <p className="text-lg ml-3 w-1/6">
                          {item.price} đ
                          <br />
                          {item.quantity} {item.unitofmeasure}
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
              <p className="font-medium text-xl w-1/4 mr-3">Tổng tiền:</p>
              <p className="text-lg w-3/4">
              {Number(orderDetail?.totalAmount).toLocaleString()} đ</p>
            </div>
            <div className="flex my-2">
              <p className="font-medium text-xl w-1/4 mr-3">
                Phương thức thanh toán:
              </p>
              <p className="text-lg w-3/4">{orderDetail?.paymentMethod}</p>
            </div>
            <div className="flex my-2">
              <p className="font-medium text-xl w-1/4 mr-3">
                Trạng thái thanh toán:
              </p>
              <p className="text-lg w-3/4">{orderDetail?.paymentStatus}</p>
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
