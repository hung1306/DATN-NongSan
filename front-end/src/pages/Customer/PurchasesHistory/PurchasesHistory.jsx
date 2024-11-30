import axios from "axios";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
import HeaderCustomer from "./../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import { API_BASE_URL } from "../../../config/config";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import OrderDetailsDialog from "../../../components/CustomerComponent/OrderDetailsDialog/OrderDetailsDialog";
import { formatDate } from "./../../../utils/formatDate";
import { toast } from "react-toastify";
import { useToast } from "../../../context/ToastContext";
import { Pagination } from "../../../components/Pagination";

export default function PurchasesHistory() {
  const [purchasesHistory, setPurchasesHistory] = useState([]);
  const { toastMessage, setToastMessage } = useToast();

  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    const fetchPurchasesHistory = async () => {
      try {
        if (toastMessage) {
          toast.success(toastMessage);
          setToastMessage(null);
        }

        const response = await axios.get(
          `${API_BASE_URL}/purchase-history/${userId}`,
          {
            params: {
              page,
              pageSize,
            },
          }
        );
        setPurchasesHistory(response.data.purchaseHistory);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPurchasesHistory();
  }, [userId, page, pageSize, toastMessage, setToastMessage]);

  const getOrderById = async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  //dialog order detail
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleButtonClick = (orderId) => {
    getOrderById(orderId)
      .then((order) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="bg-fourth">
      <HeaderCustomer />
      <div className="bg-fourth mt-36 h-5"></div>
      <div className="w-9/12 mx-auto bg-white rounded-md p-4 shadow-2xl">
        <h1 className="font-bold text-primary text-3xl">Lịch sử mua hàng</h1>
      </div>
      <div className="w-9/12 mx-auto mb-7 bg-white rounded-md p-3 mt-3 shadow-2xl min-h-screen">
        <table className="min-w-full divide-y divide-gray-300 ">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-4 text-xl font-bold text-gray-900 tracking-wider text-center">
                STT
              </th>
              <th className="px-6 py-4 text-xl font-bold text-gray-900 tracking-wider text-center">
                Mã đơn hàng
              </th>
              <th className="px-6 py-4 text-xl font-bold text-gray-900 tracking-wider text-center">
                Trạng thái đơn hàng
              </th>
              <th className="px-6 py-4 text-xl font-bold text-gray-900 tracking-wider text-center">
                Trạng thái thanh toán
              </th>
              <th className="px-6 py-4 text-xl font-bold text-gray-900 tracking-wider text-center">
                Ngày mua
              </th>
              <th className="px-6 py-4 text-xl font-bold text-gray-900 tracking-wider text-center">
                Tổng tiền
              </th>
              <th className="px-6 py-4 text-lg font-bold text-gray-900 tracking-wider text-center">
                {/* Empty header */}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 font-medium">
            {purchasesHistory.length ? (
              purchasesHistory.map((purchase, index) => (
                <tr key={purchase.orderId} className="hover:bg-gray-100">
                  <td className="p-7 text-lg text-center text-gray-900 bg-fourth ">
                    {index + 1}
                  </td>

                  <td className="p-7 text-lg text-center text-gray-900 bg-fourth ">
                    {purchase.orderId.slice(0, 8)}
                  </td>

                  <td className="p-7 text-lg text-center text-gray-900 bg-fourth ">
                    {purchase.orderStatus}
                  </td>

                  <td className="p-7 text-lg text-center text-gray-900 bg-fourth ">
                    {purchase.paymentStatus}
                  </td>

                  <td className="p-7 text-lg text-center text-gray-900 bg-fourth ">
                    {formatDate(purchase.purchaseDate)}
                  </td>

                  <td className="p-7 text-lg text-center text-gray-900 bg-fourth ">
                    {Number(purchase.totalAmount)
                      .toFixed(0)
                      .toLocaleString("vi-VN")}{" "}
                    đ
                  </td>

                  <td className="p-7 text-lg text-center bg-fourth ">
                    <button
                      className="text-primary hover:opacity-80 font-bold"
                      onClick={() => handleButtonClick(purchase.orderId)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-lg text-gray-900 bg-fourth py-4"
                >
                  Chưa có đơn hàng nào!
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* pagination */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
      <FooterCustomer />
      {isDialogOpen && (
        <OrderDetailsDialog order={selectedOrder} onClose={handleCloseDialog} />
      )}
    </div>
  );
}
