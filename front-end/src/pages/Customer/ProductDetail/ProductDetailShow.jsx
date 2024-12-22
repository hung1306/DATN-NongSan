import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faMoneyBillWave,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { addToCart } from "../../../service/CustomerService/cartService.js";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer.jsx";
import { API_BASE_URL } from "../../../config/config.js";
import FarmInfoShow from "../../../components/CustomerComponent/FarmInfoShow/FarmInfoShow.jsx";
import CommentShow from "../../../components/CustomerComponent/CommentShow/CommentShow.jsx";
import { getAmountOfReview } from "../../../service/CustomerService/reviewService.js";
import Loading from "../../../components/Loading.jsx";

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [batchId, setBatchId] = useState("");
  const [batchList, setBatchList] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productResponse, reviewResponse, batchResponse] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/product/${id}`),
            getAmountOfReview(id),
            axios.get(`${API_BASE_URL}/product-batch/customer/${id}`),
          ]);
        setProduct(productResponse.data);
        setReviewCount(reviewResponse.data);
        setBatchList(batchResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => {
    quantity === 1
      ? toast.error("Số lượng không thể nhỏ hơn 1")
      : setQuantity((prev) => prev - 1);
  };

  const changeImage = (newImage) => {
    setIsChanging(true);
    setTimeout(() => {
      setCurrentImage(newImage);
      setIsChanging(false);
    }, 100);
  };

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

    setIsAddingToCart(true);
    try {
      await addToCart(product.productid, userId, quantity, batchId);
      toast.success("Thêm vào giỏ hàng thành công!");
      setQuantity(1);
      setBatchId("");
    } catch (error) {
      toast.error(error.response.data.message);
      setBatchId("");
      setQuantity(1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center h-screen w-full">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <FarmInfoShow />
      {product && (
        <div className="bg-fourth py-3">
          <div className="w-4/5 mx-auto bg-white rounded-md flex p-5 shadow-xl">
            <div className="m-5 w-1/2">
              <img
                src={currentImage || product.productimage1}
                alt="product"
                className={`object-cover rounded-md w-full m-auto h-96 transition duration-300 ease-in-out transform shadow-2xl ${
                  isChanging ? "opacity-0 scale-90" : "scale-100"
                }`}
              />
              <div className="flex justify-center mt-10">
                {[
                  product.productimage1,
                  product.productimage2,
                  product.productimage3,
                ].map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="product"
                    className="object-cover rounded-md mx-5 w-32 h-20 cursor-pointer transition transform duration-200 shadow-2xl hover:scale-110 hover:shadow-lg"
                    onClick={() => changeImage(image)}
                  />
                ))}
              </div>
            </div>

            <div className="w-1/2">
              <h1 className="text-4xl text-primary font-bold mx-5 mt-5">
                {product.productname}
              </h1>
              <p className="mx-7 mt-3 font-thin ">
                Danh mục: {product.categoryname}
              </p>
              <div className="my-2 w-full mx-auto h-1 bg-primary"></div>
              <div className="p-1">
                <div className="m-2">
                  <span className="text-primary font-medium mr-1">
                    Giao hàng từ:{" "}
                  </span>
                  <span className="font-semibold">{product.farmprovince}</span>
                </div>

                <div className="m-2">
                  <span className="text-primary font-medium mr-1">
                    Trạng thái:{" "}
                  </span>
                  <span className="font-semibold">
                    {batchList.length > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>

                <div className="flex m-2">
                  <span className="text-primary font-medium mr-1">
                    Bình luận:{" "}
                  </span>
                  <span className="font-semibold ml-2">
                    {reviewCount[5]} bình luận
                  </span>
                </div>
                <div className="flex m-2">
                  <span className="text-primary font-medium mr-1">
                    Đánh giá:{" "}
                  </span>
                  <span className="font-semibold ml-2">
                    {reviewCount[6]}
                    <FontAwesomeIcon
                      icon={faStar}
                      color="#ffd700"
                      className="ml-1"
                    />
                  </span>
                </div>
                <div className="my-2 w-full mx-auto h-1 bg-primary"></div>
                <div className="flex m-2 mt-3">
                  <span className="text-primary font-medium mr-1 my-auto">
                    Số lượng:{" "}
                  </span>

                  <div className="w-5/12 p-1 flex items-center bg-white space-x-2 ml-3 rounded-md font-bold border">
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
                <span className="text-primary font-medium m-2 my-auto">
                  Các lô hàng:{" "}
                </span>
                <div className="m-2 flex flex-wrap justify-start">
                  {batchList.map((batch) => (
                    <div
                      key={batch.batchid}
                      className={`p-4 rounded-lg mr-4 my-4 shadow-lg cursor-pointer border hover:opacity-80 transition duration-300 ease-in-out transform hover:scale-105 w-4/12 ${
                        batchId === batch.batchid
                          ? "bg-primary text-white"
                          : "bg-fourth text-primary"
                      }`}
                      onClick={() =>
                        setBatchId(
                          batchId === batch.batchid ? "" : batch.batchid
                        )
                      }
                    >
                      <div className="text-xl ">
                        <div className="text-center">
                          {batch.promotion > 0 ? (
                            <div className="flex items-center justify-center text-center">
                              <del className="text-xl font-medium italic text-red-500">
                                {Number(batch.batchprice).toLocaleString(
                                  "vi-VN"
                                )}
                                đ
                              </del>
                              <p className="text-sm bg-red-500 text-white p-1 ml-1 shadow-lg">
                                <span className="font-bold italic text-center">
                                  -{batch.promotion}%
                                </span>
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <p className="text-sm text-red-600 rounded">
                                <span className="font-bold text-center">
                                  Mới thu hoạch
                                </span>
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mb-1 flex justify-center">
                          <span className="font-semibold text-center ">
                            {(
                              batch.batchprice -
                              batch.batchprice * batch.promotion * 0.01
                            ).toLocaleString("vi-VN")}
                            đ / {batch.unitofmeasure}
                          </span>
                        </div>
                        <div className="text-center ">
                          <span
                            className={`text-xs batchId === batch.batchid
                              ? "text-white"
                              : "text-primary"`}
                          >
                            Còn {batch.batchquantity} phần
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex m-2 w-full">
                  <button
                    className="bg-primary text-white font-bold px-4 py-3 rounded-md mt-4 w-5/12 shadow-xl hover:opacity-90"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    <>
                      Thêm vào giỏ hàng
                      <FontAwesomeIcon icon={faShoppingCart} className="ml-2" />
                    </>
                  </button>
                  <button
                    className="bg-primary text-white font-bold px-4 py-3 rounded-md mt-4 w-5/12 shadow-xl hover:opacity-90 ml-7"
                    onClick={() => navigate("/cart")}
                  >
                    Mua ngay{" "}
                    <FontAwesomeIcon icon={faMoneyBillWave} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-4/5 mx-auto bg-white rounded-lg p-6 mt-5 shadow-xl space-y-6">
            <h1 className="font-bold text-primary text-2xl">
              Thông tin chi tiết về sản phẩm
            </h1>
            <p className="text-justify text-base font-medium text-gray-700 leading-relaxed">
              {product.overviewdes}
            </p>

            {product.healtbenefit && (
              <>
                <p className="text-justify text-xl font-bold text-primary">
                  Lợi ích đối với sức khỏe
                </p>
                <p className="text-justify text-base font-medium text-gray-700 leading-relaxed">
                  {product.healtbenefit}
                </p>
              </>
            )}

            {product.storagemethod && (
              <>
                <p className="text-justify text-xl font-bold text-primary">
                  Phương pháp bảo quản sản phẩm
                </p>
                <p className="text-justify text-base font-medium text-gray-700 leading-relaxed">
                  {product.storagemethod}
                </p>
              </>
            )}

            {product.cookingmethod && (
              <>
                <p className="text-justify text-xl font-bold text-primary">
                  Phương pháp chế biến sản phẩm
                </p>
                <p className="text-justify text-base font-medium text-gray-700 leading-relaxed">
                  {product.cookingmethod}
                </p>
              </>
            )}
          </div>

          <div className="w-4/5 mx-auto bg-white rounded-md p-5 mt-3 mb-7 shadow-2xl">
            <h1 className="font-bold text-primary text-2xl my-3">
              Bình luận, đánh giá về sản phẩm
            </h1>
            <CommentShow />
          </div>
        </div>
      )}
      <FooterCustomer />
    </>
  );
}
