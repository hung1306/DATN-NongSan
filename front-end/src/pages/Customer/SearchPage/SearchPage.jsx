import { useLocation, useNavigate } from "react-router-dom";
import { addToCart } from "../../../service/CustomerService/cartService";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import HeaderCustomer from "../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import FooterCustomer from "./../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
import ProductList from "../../../components/CustomerComponent/ProductList/ProductList";
import Loading from "../../../components/Loading";
import { useEffect, useState } from "react";

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  const [productSearch, setProductSearch] = useState([]);
  
  useEffect(() => {
    setLoading(true);
    setProductSearch(location.state.productSearch);
    setLoading(false);
  }, [location.state.productSearch]);

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
      <div className="bg-fourth">
        <div className="w-4/5 mx-auto bg-white rounded-md p-5 mt-36 shadow-2xl">
          {productSearch && productSearch.length > 0 ? (
            <h1 className="font-bold text-primary text-2xl">
              Sản phẩm tìm được...
            </h1>
          ) : (
            <h1 className="font-bold text-primary text-2xl">
              Không tìm thấy sản phẩm nào!
            </h1>
          )}
        </div>

        <div className="rounded-md shadow-2xl w-4/5 bg-white m-auto flex flex-wrap justify-center my-5 mb-10 h-screen">
          {loading ? (
            <Loading />
          ) : (
            <ProductList
              products={productSearch}
              handleAddToCart={handleAddToCart}
            />
          )}
        </div>

        <FooterCustomer />
      </div>
    </>
  );
}

export default SearchPage;
