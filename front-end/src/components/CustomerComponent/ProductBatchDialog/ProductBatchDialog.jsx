import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/config";
import axios from "axios";
import { addToCart } from "../../../service/CustomerService/cartService";
import { jwtDecode } from "jwt-decode";
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
    quantity === 1 ? toast.error("Số lượng không thể nhỏ hơn 1") : setQuantity(prev => prev - 1);
  };
  const handleIncrease = () => {
    setQuantity((prev) => prev + 1)
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-3 rounded-lg w-4/12 h-2/5 m-auto text-primary overflow-auto shadow-2xl border border-primary relative">
        <ToastContainer />
        <div className="flex justify-end">
          <button
            className="text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-2xl text-center font-bold">
          Thêm vào giỏ hàng của bạn
        </h2>
        {/* Them dau gach */}
        {/* <div className="flex justify-center w-full">
          <div className="w-full bg-primary h-1 mt-3 mb-3"></div>
        </div> */}
        <div className="flex mt-3 m-auto">
          <span className="text-primary font-bold mr-1 my-auto">
            Chọn số lượng:{" "}
          </span>
          <div className="w-9/12 p-1 flex items-center bg-white space-x-2 ml-3 rounded-md font-bold border">
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
        <div className="m-2 flex flex-wrap justify-around">
          {productBatchs.map((batch) => (
            <div
              key={batch.batchid}
              className={`p-3 rounded-lg my-4 shadow-lg cursor-pointer border hover:opacity-80 transition duration-300 ease-in-out transform hover:scale-105 w-5/12 ${
                batchId === batch.batchid
                  ? "bg-primary text-white"
                  : "bg-fourth"
              }`}
              onClick={() =>
                setBatchId(batchId === batch.batchid ? "" : batch.batchid)
              }
            >
              <div className="mb-2 text-center">
                {/* <span className={`font-medium mr-1 ${batchId === batch.batchid ? "text-white" : "text-primary"}`}>
                  Mã lô hàng:{" "}
                </span> */}
                <span
                  className={`font-bold text-xl text-center ${
                    batchId === batch.batchid ? "text-white" : ""
                  }`}
                >
                  {batch.batchid.substring(0, 8)}
                </span>
              </div>
              <div className="mb-2">
                <span
                  className={`font-medium mr-1 ${
                    batchId === batch.batchid ? "text-white" : "text-primary"
                  }`}
                >
                  Giá:{" "}
                </span>
                <span
                  className={`font-semibold ${
                    batchId === batch.batchid ? "text-white" : ""
                  }`}
                >
                  {Number(batch.batchprice).toLocaleString()} (
                  {batch.unitofmeasure})
                </span>
              </div>
              <div className="mb-2">
                <span
                  className={`font-medium mr-1 ${
                    batchId === batch.batchid ? "text-white" : "text-primary"
                  }`}
                >
                  Giảm giá:{" "}
                </span>
                <span
                  className={`font-semibold ${
                    batchId === batch.batchid ? "text-white" : ""
                  }`}
                >
                  {batch.promotion} %
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            className="bg-primary font-bold text-white px-5 py-2 rounded-xl hover:opacity-90"
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}

ProductBatchDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedProduct: PropTypes.object.isRequired,
};
