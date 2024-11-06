import HeaderShipper from "../../../components/ShipperComponent/HeaderShipper"; // Adjust path as needed
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config";
import ShipperDetail from "./ShipperDetail";
import { Pagination } from "../../../components/Pagination";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export default function ShipperPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const shipperId = decodedToken.userid;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/shipper/orders/${shipperId}`,
          {
            params: {
              page,
              pageSize,
            },
          }
        );
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.log("Failed to fetch orders: ", error);
      }
    };
    fetchOrders();
  }, [page, pageSize]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const [isOpenOrderDetail, setIsOpenOrderDetail] = useState(false);
  const [orderIdDetail, setOrderIdDetail] = useState(null);

  const openOrderDetailDialog = (orderId) => {
    setIsOpenOrderDetail(true);
    setOrderIdDetail(orderId);
  };

  const refreshOrders = () => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/shipper/orders/${shipperId}`,
          {
            params: {
              page,
              pageSize,
            },
          }
        );
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.log("Failed to refresh orders: ", error);
      }
    };
    fetchOrders();
  };

  return (
    <div>
      <HeaderShipper />
      <ToastContainer />
      <div className="flex">
        <div className="bg-secondary w-full right-0 top-0 mt-20">
          <div className="w-10/12 m-auto bg-white rounded-lg px-3 mt-5">
            <h2 className="my-4 px-4 text-primary font-bold text-3xl">
              Danh sách đơn hàng
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse shadow-2xl">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="w-1/12 py-2">Mã đơn hàng</th>
                    <th className="w-2/12 py-2">Tên khách hàng</th>
                    <th className="w-1/12 py-2">Số điện thoại</th>
                    <th className="w-2/12 py-2">Địa chỉ nhận hàng</th>
                    <th className="w-1/12 py-2">Tổng tiền</th>
                    <th className="w-2/12 py-2">Trạng thái đơn hàng</th>
                    <th className="w-2/12 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.orderid}
                      className="text-center font-medium border"
                    >
                      <td className="py-2">{order.orderid.slice(0, 8)}</td>
                      <td className="py-2">{order.customer_name}</td>
                      <td className="py-2">{order.phonenumber}</td>{" "}
                      {/* Assuming phone number is included in the API response */}
                      <td className="py-2">{order.shippingaddress}</td>
                      <td className="py-2">
                        {order.totalamount.toLocaleString()} đ
                      </td>
                      <td className="py-2">{order.orderstatus}</td>
                      <td className="py-2">
                        <button
                          className="bg-primary text-white font-bold px-4 py-2 rounded-lg"
                          onClick={() => openOrderDetailDialog(order.orderid)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
      {isOpenOrderDetail && (
        <ShipperDetail
          onClose={() => setIsOpenOrderDetail(false)}
          orderIdDetail={orderIdDetail}
          refreshOrders={refreshOrders}
        />
      )}
    </div>
  );
}
