import HeaderDistributor from "../../components/HeaderDistributor";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/config";
import { ToastContainer } from "react-toastify";
import ShipperDetail from "./ShipperDetail";
import { Pagination } from "../../components/Pagination";

export default function ShipperPage() {
  const [shippers, setShippers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Số lượng shipper trên mỗi trang

  useEffect(() => {
    // Gọi API để lấy thông tin shipper
    const fetchShippers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/shipper`, {
          params: { page, limit },
        });
        setShippers(response.data.shippers);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy thông tin shipper:", error);
      }
    };
    fetchShippers();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const [isOpenDetailShipper, setIsOpenDetailShipper] = useState(false);
  const [shipperId, setShipperId] = useState(null);

  const openDetailShipper = (userId) => {
    setIsOpenDetailShipper(true);
    setShipperId(userId);
  };

  const refreshShipper = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shipper`, {
        params: { page, limit },
      });
      setShippers(response.data.shippers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Có lỗi xảy ra khi lấy thông tin shipper:", error);
    }
  };

  return (
    <div>
      <HeaderDistributor />
      <div className="flex">
        <ToastContainer />
        <div className="bg-secondary w-full right-0 top-0 mt-20">
          <div className="w-10/12 m-auto bg-white rounded-lg px-3 mt-5">
            <h2 className="my-4 px-4 text-primary font-bold text-3xl">
              Danh sách người giao hàng
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse shadow-2xl">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="w-1/6 py-2">Tên người giao hàng</th>
                    <th className="w-1/12 py-2">Số điện thoại</th>
                    <th className="w-1/4 py-2">Trạng thái người giao hàng</th>
                    <th className="w-1/6 py-2">Trạng thái tài khoản</th>
                    <th className="w-1/6 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(shippers) ? (
                    shippers.map((shipper) => (
                      <tr
                        key={shipper.userid}
                        className="text-center font-medium border"
                      >
                        <td className="py-2">{shipper.fullname}</td>
                        <td className="py-2">{shipper.phonenumber}</td>
                        <td className="py-2">{shipper.shipperstatus}</td>
                        <td className="py-2">
                          {shipper.status ? "Đã kích hoạt" : "Chưa kích hoạt"}
                        </td>
                        <td className="py-2">
                          <button
                            className="bg-primary text-white font-bold px-4 py-2 rounded-lg"
                            onClick={() => openDetailShipper(shipper?.userid)}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-2">
                        Không có shipper nào
                      </td>
                    </tr>
                  )}
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
      {isOpenDetailShipper && (
        <ShipperDetail
          onClose={() => {
            setIsOpenDetailShipper(false);
            refreshShipper();
          }}
          shipperId={shipperId}
        />
      )}
    </div>
  );
}
