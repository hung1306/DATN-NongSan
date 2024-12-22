import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faTractor,
  faCartPlus,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useState } from "react";
import ProductBatchDialog from "../ProductBatchDialog/ProductBatchDialog";
import { toast } from "react-toastify";

const ProductList = ({ products }) => {
  // const navigate = useNavigate();
  const [isOpenProductBatchDialog, setIsOpenProductBatchDialog] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const onAddToCart = async (product) => {
    try {
      setIsOpenProductBatchDialog(true);
      setSelectedProduct(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng!");
    }
  };

  return (
    <div className="bg-secondary m-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6 px-3 rounded-lg">
      {products.map((product) => {
        return (
          <div
            key={product.productid}
            className="bg-fourth rounded-lg overflow-hidden shadow-2xl m-3 cursor-pointer transform transition duration-500 hover:shadow-3xl"
          >
            <Link to={`/product/${product.productid}`} key={product.productid}>
              <img
                className="w-full h-64 object-cover transition duration-500 ease-in-out transform hover:scale-110"
                src={product.productimage1}
                alt={product.productname}
              />
            </Link>
            <div className="px-6 py-4 text-primary">
              <Link
                to={`/product/${product.productid}`}
                key={product.productid}
              >
                <div className="flex justify-center mb-2">
                  <p className="font-bold text-center text-2xl">
                    {product.productname}
                  </p>
                  <p className="text-center text-lg text-primary ml-2 mt-1">
                    ({product.average_rating ? product.average_rating : "0"}
                    <FontAwesomeIcon icon={faStar} color="#ffd700" size="1x" />)
                  </p>
                </div>
                
                <p className="text-xs text-center m-2 text-primary font-medium italic">
                  Số lượng còn lại{" "}
                  {/* <span className="text-primary font-bold"> */}
                    {product.batchquantity} suất
                  {/* </span> */}
                </p>
                <div className="flex justify-between my-1">
                  {product.promotion > 0 ? (
                    <div className="flex items-center">
                      <del className="text-xl font-medium italic text-red-500 transition duration-300 ease-in-out transform hover:scale-110 hover:text-red-600">
                        {Number(product.batchprice).toLocaleString("vi-VN")}đ
                      </del>
                      <p className="text-sm bg-red-500 text-white p-1 ml-1 shadow-lg transition duration-300 ease-in-out transform hover:scale-110 hover:bg-red-600">
                        <span className="font-bold italic text-center animate-pulse">
                          -{product.promotion}%
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <p className="text-sm text-red-600 rounded p-2 transition duration-300 ease-in-out transform hover:scale-105 ">
                        <span className="font-bold italic text-center animate-bounce">
                          Mới thu hoạch
                        </span>
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between flex-col">
                    <p className="text-3xl font-bold text-primary transition duration-300 ease-in-out transform hover:scale-110">
                      {(
                        product.batchprice -
                        product.batchprice * product.promotion * 0.01
                      ).toLocaleString("vi-VN")}
                      đ
                    </p>
                    <span className="text-base text-center italic">
                        ({product.unitofmeasure})
                    </span>
                  </div>
                </div>
              </Link>
              <div className="flex justify-between items-center mt-4">
                <Link to={`/farm/info/${product.farmid}`}>
                  <div className="text-primary font-bold italic">
                    <div className="flex items-center hover:opacity-90 hover:underline">
                      <FontAwesomeIcon icon={faMapMarkerAlt} size="lg" />
                      <p className="ml-2">{product.farmprovince}</p>
                    </div>
                    <div className="flex items-center mt-2 hover:opacity-90 hover:underline">
                      <FontAwesomeIcon icon={faTractor} size="lg" />
                      <p className="ml-2">{product.farmname}</p>
                    </div>
                  </div>
                </Link>

                <button
                  className="p-4 bg-white text-primary rounded-full hover:bg-primary hover:text-white hover:scale-125 transform transition duration-300 ease-in-out hover:shadow-md"
                  onClick={() => onAddToCart(product)}
                >
                  <FontAwesomeIcon icon={faCartPlus} size="2x" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {isOpenProductBatchDialog && (
        <ProductBatchDialog
          onClose={() => setIsOpenProductBatchDialog(false)}
          selectedProduct={selectedProduct}
        />
      )}
    </div>
  );
};

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
};

export default ProductList;
