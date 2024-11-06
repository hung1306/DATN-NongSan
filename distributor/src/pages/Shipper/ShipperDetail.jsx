import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ShipperDetail({ onClose, shipperId }) {
  const [shipperDetails, setShipperDetails] = useState(null);
  const [shipperStatus, setShipperStatus] = useState(null);

  useEffect(() => {
    const fetchShipper = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/shipper/${shipperId}`
        );
        setShipperDetails(response.data);
        setShipperStatus(response.data.status);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin shipper:", error);
      }
    };
    fetchShipper();
  }, [shipperId]);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      const newStatus = !shipperStatus;
      await axios.put(
        `${API_BASE_URL}/shipper/updateregisterstatus/${shipperId}`,
        {
          status: newStatus,
        }
      );
      setShipperStatus(newStatus);
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái shipper:", error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-4/12 m-auto overflow-auto shadow-xl border border-primary">
        <div className="flex justify-end">
          <button
            className="text-primary px-2 hover:bg-primary hover:text-secondary text-3xl font-bold"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-3xl text-center text-primary font-bold">
          Chi tiết người giao hàng
        </h2>
        <div className="border border-primary mt-2"></div>

        <div className="py-4">
          <div className="flex my-3">
            <p className="font-bold text-xl text-primary w-1/3">
              Tên người giao hàng:
            </p>
            <p className="text-lg font-medium w-2/3">
              {shipperDetails?.fullname}
            </p>
          </div>
          <div className="flex my-3">
            <p className="font-bold text-xl text-primary w-1/3">Địa chỉ:</p>
            <p className="text-lg font-medium w-2/3">
              {shipperDetails?.street}, {shipperDetails?.commune},{" "}
              {shipperDetails?.district}, {shipperDetails?.province}
            </p>
          </div>
          <div className="flex my-3">
            <p className="font-bold text-xl text-primary w-1/3">
              Số CMND/CCCD:
            </p>
            <p className="text-lg font-medium w-2/3">
              {shipperDetails?.indentitycard}
            </p>
          </div>
          <div className="flex my-3">
            <p className="font-bold text-xl text-primary w-1/3">Email:</p>
            <p className="text-lg font-medium w-2/3">{shipperDetails?.email}</p>
          </div>
          <div className="flex my-3">
            <p className="font-bold text-xl text-primary w-1/3">
              Số điện thoại:
            </p>
            <p className="text-lg font-medium w-2/3">
              {shipperDetails?.phonenumber}
            </p>
          </div>
          <div className="flex my-3">
            <p className="font-bold text-xl text-primary w-1/3">
              Khu vực giao hàng:
            </p>
            <p className="text-lg font-medium w-2/3">
              {shipperDetails?.deliveryarea}
            </p>
          </div>
          <div className="flex my-3">
            <p className="font-bold text-xl text-primary w-1/3">Trạng thái:</p>
            <p className="text-lg font-medium w-2/3">
              {shipperStatus ? (
                <>
                  <span className="text-green-500">Đã kích hoạt</span>
                  <button
                    onClick={handleStatusChange}
                    className="bg-red-500 text-white font-bold py-1 px-4 rounded-lg mx-3"
                  >
                    Chặn
                  </button>
                </>
              ) : (
                <>
                  <span className="text-red-500">Chưa kích hoạt</span>
                  <button
                    onClick={handleStatusChange}
                    className="bg-primary text-white font-bold py-1 px-4 rounded-lg mx-3"
                  >
                    Kích hoạt
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

ShipperDetail.propTypes = {
  onClose: PropTypes.func.isRequired,
  shipperId: PropTypes.string.isRequired,
};
