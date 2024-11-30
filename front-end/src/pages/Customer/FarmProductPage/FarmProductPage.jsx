import axios from "axios";
import { useState, useEffect } from "react";
import {  useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../config/config";
import { toast } from "react-toastify";
import { addToCart } from "../../../service/CustomerService/cartService";
import { jwtDecode } from "jwt-decode";
import FarmInfoShow from "../../../components/CustomerComponent/FarmInfoShow/FarmInfoShow.jsx";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer.jsx"; 
import Loading from "../../../components/Loading.jsx";
import ProductList from "../../../components/CustomerComponent/ProductList/ProductList.jsx";

export default function FarmProductPage() {
  const navigate = useNavigate();
  let { id } = useParams(); // Lấy farmid từ URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/farm/productdetail/${id}`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = (productId, batchId) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      toast.error("Đăng nhập để thêm vào giỏ hàng!");
      navigate("/login");
    } else {
      const decodedToken = jwtDecode(accessToken);
      const userId = decodedToken.userid;

      addToCart(productId, userId, 1, batchId)
        .then((response) => {
          response;
          toast.success("Thêm vào giỏ hàng thành công!");
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    }
  };

  return (
    <div>
      {/* Component FarmInfoShow được hiển thị ở đầu trang */}
      <FarmInfoShow />
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Nội dung chính của trang */}
          <div className="bg-fourth m-auto flex flex-wrap justify-center">
            <div className="w-4/5 mt-3 mb-10 rounded-md bg-white m-auto flex flex-wrap justify-center shadow-2xl">
              {loading ? (
                <Loading />
              ) : (
                <ProductList
                  products={products}
                  handleAddToCart={handleAddToCart}
                />
              )}
            </div>
            <FooterCustomer />
          </div>
        </>
      )}
    </div>
  );
}
