import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderCustomer from "../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
import { API_BASE_URL } from "../../../config/config";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { addToCart } from "../../../service/CustomerService/cartService";
import Loading from "../../../components/Loading";
import ProductList from "../../../components/CustomerComponent/ProductList/ProductList";

function CategoryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      const response = await axios.get(
        `${API_BASE_URL}/category/${id}/product`
      );
      setProducts(response.data);
    };

    fetchProducts();
    setLoading(false);
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
    <>
      <HeaderCustomer />
      <div className="bg-fourth mt-36 h-5"></div>
      <div className="bg-fourth">
        <div className="w-4/5 mx-auto bg-white rounded-md p-5 shadow-2xl">
          {products && products.length > 0 ? (
            <h1 className="font-bold text-primary text-2xl">
              Danh mục sản phẩm: {products[0].categoryname} 
            </h1>
          ) : (
            <h1 className="font-bold text-primary text-2xl">
              Danh Mục chưa có sản phẩm nào
            </h1>
          )}
        </div>
        <div className="rounded-md w-4/5 bg-white m-auto flex flex-wrap justify-center mt-3 shadow-2xl mb-16">
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
  );
}

export default CategoryPage;
