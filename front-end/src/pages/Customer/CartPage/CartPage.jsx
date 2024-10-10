import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../../config/config";
import HeaderCustomer from "../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import { useNavigate } from "react-router-dom";
import { updateQuantityCart } from "../../../service/CustomerService/cartService";
import DeleteCartDialog from "./DeleteCartDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Loading from "../../../components/Loading";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/cart/${userId}`, {
          params: {
            page,
            pageSize,
          },
        });
        setCart(response.data.cartItems);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId, page, pageSize]);

  // Dialog xác nhận xóa sản phẩm khỏi giỏ hàng
  const [isOpenDeleteCart, setIsOpenDeleteCart] = useState(false);

  const [productId, setProductId] = useState("");
  const refreshCart = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`, {
        params: {
          page,
          pageSize,
        },
      });
      setCart(response.data.cartItems);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };
  const onDeleteCart = async (productId) => {
    setIsOpenDeleteCart(true);
    setProductId(productId);
  };

  const [selectedItems, setSelectedItems] = useState([]);
  // const [totalPrice, setTotalPrice] = useState(0);

  const handleCheckboxChange = (item) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(item)) {
        return prevSelectedItems.filter((i) => i !== item);
      } else {
        return [...prevSelectedItems, item];
      }
    });
  };

  // const calculateTotalPrice = () => {
  //   return selectedItems.reduce((total, item) => {
  //     return total + item.productprice * item.quantity;
  //   }, 0);
  // };

  const handleUpdateQuantity = (productid, quantity) => {
    if (quantity === 0) {
      toast.error("Số lượng sản phẩm phải lớn hơn 0");
      return;
    }
    updateQuantityCart(userId, productid, quantity);

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productid === productid ? { ...item, quantity } : item
      )
    );
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán", {
        position: "top-right",
      });
      return;
    }
    navigate("/checkout", { state: { selectedItems } });
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loading />
        </div>
      ) : (
        <div className="bg-fourth">
          <HeaderCustomer />

          <div className="w-4/5 mx-auto bg-white rounded-md p-5 mt-32 shadow-2xl">
            <h1 className="font-bold text-primary text-2xl">
              GIỎ HÀNG CỦA BẠN
            </h1>
          </div>

          <div className="w-4/5 mx-auto bg-white rounded-lg p-6 my-5 shadow-2xl mt-5 min-h-screen">
            <table className="min-w-full divide-y">
              <thead className="bg-white shadow-2xl">
                <tr className="border rounded-xl">
                  <th
                    scope="col"
                    className="px-6 py-3 text-xl font-bold text-primary tracking-wider text-center"
                  >
                    STT
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xl font-bold text-primary tracking-wider text-center"
                  >
                    Tên sản phẩm
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xl font-bold text-primary tracking-wider text-center"
                  >
                    Hình ảnh
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-xl font-bold text-primary tracking-wider text-center"
                  >
                    Đơn giá
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xl font-bold text-primary tracking-wider text-center"
                  >
                    Số lượng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xl font-bold text-primary tracking-wider text-center"
                  >
                    Tình trạng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xl font-bold text-primary tracking-wider text-center"
                  >
                    Chọn mua
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xl font-bold text-primary tracking-wider text-center"
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cart.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary  font-medium border">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary  font-medium border">
                      {item.productname}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary  font-medium border">
                      <img
                        src={item.productimage1}
                        alt={item.productimage1}
                        className="w-48 h-16 object-cover m-auto"
                      />
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary  font-medium border">
                      {Number(item.batchprice)} VNĐ
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary  font-medium border">
                      {item.quantity > 0 && (
                        <button
                          className="font-extrabold text-2xl mx-5 w-8 h-8 bg-primary text-white rounded-lg hover:opacity-80"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productid,
                              item.quantity - 1
                            )
                          }
                        >
                          -
                        </button>
                      )}
                      {item.quantity}
                      <button
                        className="font-extrabold text-2xl mx-5 w-8 h-8 bg-primary text-white rounded-lg hover:opacity-80"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productid,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary  font-medium border">
                      {item.batchquantity > item.quantity
                        ? "Còn hàng"
                        : "Hết hàng"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary  font-medium border">
                      <input
                        type="checkbox"
                        className="bg-primary text-white px-3 py-1 rounded-md m-2"
                        onChange={() => handleCheckboxChange(item)}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary  font-medium border">
                      <button
                        className="bg-red-500 text-white px-4 py-1 rounded-lg m-2 hover:opacity-80"
                        onClick={() => onDeleteCart(item.productid)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* <div className="flex justify-end p-3 ">
              <span className="text-lg font-bold">
                Tổng tiền: {calculateTotalPrice()}{" "}
              </span>
            </div> */}
            {/* pagination */}
            <div className="flex justify-center my-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="text-primary border border-black font-bold px-4 py-2 rounded-l-xl"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              {page > 1 && (
                <button
                  className="text-primary border border-black font-bold px-4 py-2 "
                  onClick={() => handlePageChange(page - 1)}
                >
                  {page - 1}
                </button>
              )}
              <button className="bg-primary text-secondary border border-black font-bold px-4 py-2 ">
                {page}
              </button>
              {page < totalPages && (
                <button
                  className="text-primary border border-black font-bold px-4 py-2 "
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </button>
              )}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="text-primary border border-black font-bold px-4 py-2 rounded-r-xl"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            {/* Checkout */}
            <div className="flex justify-end">
              <button
                className="bg-primary text-white px-7 py-3 rounded-lg m-2 font-bold"
                onClick={handleCheckout}
              >
                Thanh toán
              </button>
            </div>
          </div>

          <FooterCustomer />

          {isOpenDeleteCart && (
            <DeleteCartDialog
              onClose={() => setIsOpenDeleteCart(false)}
              productId={productId}
              userId={userId}
              refreshCart={refreshCart}
            />
          )}
        </div>
      )}
    </>
  );
}
