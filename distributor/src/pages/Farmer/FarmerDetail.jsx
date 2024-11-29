import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function FarmerDetail({ onClose, farmerId }) {
  const [farmerDetails, setFarmerDetails] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/farmer/detail/${farmerId}`
        );
        setFarmerDetails(response.data);
        setStatus(response.data.status); 
      } catch (error) {
        console.error("Lỗi khi lấy thông tin nông dân:", error);
      }
    };
    fetchFarmer();
  }, [farmerId]);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      const newStatus = !status;
      await axios.put(
        `${API_BASE_URL}/farmer/update/status/${farmerId}`,
        { status: newStatus }
      );
      setStatus(newStatus); 
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nông dân:", error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-6 rounded w-4/12 m-auto overflow-auto shadow-2xl">
        <div className="flex justify-end">
          <button
            className="text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-3xl text-center text-primary font-bold">
          Chi tiết nông dân
        </h2>
        <div className="py-4 text-justify">
          <div className="flex m-3">
            <p className="font-bold text-xl text-primary">
              Tên nông dân:
            </p>
            <p className="text-lg font-medium ml-2">
              {farmerDetails?.fullname}
            </p>
          </div>
          <div className="flex m-3">
            <p className="font-bold text-xl text-primary">
              Email:
            </p>
            <p className="text-lg font-medium ml-2">{farmerDetails?.email}</p>
          </div>
          <div className="flex m-3">
            <p className="font-bold text-xl text-primary">Số điện thoại:</p>
            <p className="text-lg font-medium ml-2">
              {farmerDetails?.phonenumber}
            </p>
          </div>
          <div className="flex m-3">
            <p className="font-bold text-xl text-primary">Tên trang trại:</p>
            <p className="text-lg font-medium ml-2">
              {farmerDetails?.farmname}
            </p>
          </div>
          <div className="flex m-3">
            <p className="font-bold text-xl text-primary">Số CCCD:</p>
            <p className="text-lg font-medium ml-2">
              {farmerDetails?.indentitycard}
            </p>
          </div>
          <div className="flex m-3">
            <p className="font-bold text-xl text-primary">Địa chỉ:</p>
            <p className="text-lg font-medium ml-2">
              {farmerDetails?.street}, {farmerDetails?.commune},{" "}
              {farmerDetails?.district}, {farmerDetails?.province}
            </p>
          </div>
          <div className="flex m-3">
            <p className="font-bold text-xl text-primary">Trạng thái:</p>
            {status ? (
              <>
                <p className="text-lg font-medium ml-2 text-green-500">
                  Đã kích hoạt
                </p>
                <button
                  onClick={handleStatusChange}
                  className="bg-red-500 text-white font-bold p-2 rounded-lg mx-3"
                >
                  Chặn
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium ml-2 text-red-500">
                  Chưa kích hoạt
                </p>
                <button
                  onClick={handleStatusChange}
                  className="bg-primary text-white font-bold p-2 rounded-lg mx-3"
                >
                  Kích hoạt
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

FarmerDetail.propTypes = {
  onClose: PropTypes.func.isRequired,
  farmerId: PropTypes.string.isRequired,
};