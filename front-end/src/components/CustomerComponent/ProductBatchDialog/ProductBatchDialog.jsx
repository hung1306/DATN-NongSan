import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/config";
import axios from "axios";
import { addToCart } from "../../../service/CustomerService/cartService";
import {jwtDecode} from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ProductBatchDialog({ onClose, selectedProduct }) {
  const navigate = useNavigate();
  const [productBatchs, setProductBatchs] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/product-batch/customer/${selectedProduct.productid}`
        );
        setProductBatchs(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [selectedProduct]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Đăng nhập để thêm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userid;
    if (!batchId) {
      toast.error("Vui lòng chọn lô hàng bạn muốn mua!");
      return;
    }

    try {
      await addToCart(selectedProduct.productid, userId, quantity, batchId);
      toast.success("Thêm vào giỏ hàng thành công!");
      setBatchId("");
      setQuantity(1);
      setTimeout(onClose, 500);
    } catch (error) {
      toast.error(error.response.data.message);
      setBatchId("");
      setQuantity(1);
    }
  };

  const handleDecrease = () => {
    quantity === 1
      ? toast.error("Số lượng không thể nhỏ hơn 1")
      : setQuantity((prev) => prev - 1);
  };
  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-6 rounded-lg w-1/3 h-auto m-auto text-primary shadow-2xl border border-primary relative">
        <ToastContainer />
        {/* Button đóng */}
        <button
          className="absolute top-3 right-3 text-primary text-2xl hover:bg-primary hover:text-white rounded-full p-1"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-3xl text-center font-bold mb-6">
          Thêm vào giỏ hàng của bạn
        </h2>
        {/* Danh sách lô hàng */}
        <div className={`grid ${productBatchs.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mb-6`}>
          {productBatchs.map((batch) => (
            <div
              key={batch.batchid}
              className={`p-4 rounded-lg shadow-lg border cursor-pointer hover:opacity-90 transition-transform transform ${
                batchId === batch.batchid
                  ? "bg-primary text-white"
                  : "bg-fourth text-primary"
              } ${productBatchs.length === 1 ? 'w-9/12 m-auto' : ''}`}
              onClick={() =>
                setBatchId(batchId === batch.batchid ? "" : batch.batchid)
              }
            >
              <div className="text-center font-bold text-xl mb-2">
                {batch.batchid.substring(0, 8)}
              </div>
              <div className="text-sm">
                <div className="mb-1">
                  Giá:{" "}
                  <span className="font-semibold">
                    {Number(batch.batchprice).toLocaleString()} (
                    {batch.unitofmeasure})
                  </span>
                </div>
                <div>
                  Giảm giá:{" "}
                  <span className="font-semibold">{batch.promotion} %</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {/* Chọn số lượng */}
          <div className="flex items-center justify-center w-7/12 py-3">
            <span className="text-primary font-bold mr-2">Chọn số lượng:</span>
            <div className="flex items-center border rounded-md w-7/12">
              <button
                onClick={handleDecrease}
                className="w-1/3 px-2 py-1 rounded-md text-gray-900 hover:bg-gray-200"
              >
                -
              </button>
              <span className="w-1/3 px-2 text-center">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="w-1/3 px-2 py-1 rounded-md text-gray-900 hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút thêm vào giỏ hàng */}
          <div className="">
            <button
              className="bg-primary font-bold text-white px-7 py-3 rounded-xl hover:opacity-90"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductBatchDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedProduct: PropTypes.object.isRequired,
};