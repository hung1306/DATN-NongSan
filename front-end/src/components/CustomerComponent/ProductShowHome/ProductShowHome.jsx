import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config/config";
import { toast } from "react-toastify";
import { addToCart } from "../../../service/CustomerService/cartService";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import Loading from "../../Loading.jsx";
import ProductList from "../ProductList/ProductList.jsx";

export default function ProductShowHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy user_id từ localStorage
  const [userId, setUserId] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userid);
    } else {
      const randomUserId = uuidv4();
      setUserId(randomUserId);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (userId === "") return;

        const response = await axios.get(
          `${API_BASE_URL}/recommendation/${userId}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userId]);

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
    <div className="bg-secondary m-auto flex flex-wrap justify-center py-6 rounded-lg shadow-2xl">
      <h1 className="text-3xl font-bold text-center text-primary">
        Dành cho bạn
      </h1>
      {loading ? (
        <Loading />
      ) : (
        <ProductList products={products} handleAddToCart={handleAddToCart} />
      )}
    </div>
  );
}
