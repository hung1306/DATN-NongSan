import { useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../../config/config";
import HeaderCustomer from "../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import { Link, useNavigate } from "react-router-dom";
import { updateQuantityCart } from "../../../service/CustomerService/cartService";
import DeleteCartDialog from "./DeleteCartDialog";
import Loading from "../../../components/Loading";
import { Pagination } from "../../../components/Pagination";

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

  const handleDeleteCart = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/cart/${userId}/${productId}`);
      toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
      setIsOpenDeleteCart(false);
      refreshCart();
    } catch (error) {
      console.error("Error deleting cart item:", error);
      toast.error("Xóa sản phẩm khỏi giỏ hàng thất bại");
    }
  };

  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (item) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(item)) {
        return prevSelectedItems.filter((i) => i !== item);
      } else {
        return [...prevSelectedItems, item];
      }
    });
  };

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
        <div className="flex justify-center items-center h-screen w-full">
          <Loading />
        </div>
      ) : (
        <div className="bg-fourth">
          <HeaderCustomer />
          <div className="bg-fourth mt-36 h-5"></div>
          <div className="w-4/5 mx-auto bg-white rounded-md p-5 shadow-2xl">
            <h1 className="font-bold text-primary text-2xl">
              Giỏ hàng của bạn 
            </h1>
          </div>

          <div className="w-4/5 mx-auto bg-white rounded-lg p-6 my-3 shadow-2xl min-h-screen">
          
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
                {cart.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-3 py-2 text-lg text-center text-primary font-medium border"
                    >
                      Giỏ hàng của bạn đang trống
                    </td>
                  </tr>
                ) : (
                  cart.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary font-medium border">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary font-medium border">
                        <Link
                          to={`/product/${item.productid}`}
                          className="text-primary cursor-pointer"
                        >
                          {item.productname} ({item.farmname})
                        </Link>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary font-medium border">
                        <Link
                          to={`/product/${item.productid}`}
                          className="block"
                        >
                          <img
                            src={item.productimage1}
                            alt={item.productname}
                            className="w-48 h-16 object-cover m-auto"
                          />
                        </Link>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary font-medium border">
                        {Number(item.batchprice).toLocaleString()} đ
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary font-medium border">
                        {item.quantity > 0 && (
                          <button
                            className="font-extrabold text-2xl mx-5 w-8 h-8 bg-primary text-white rounded-lg hover:opacity-80"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.productid,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity - 1 === 0}
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
                          disabled={item.quantity + 1 > item.batchquantity}
                        >
                          +
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary font-medium border">
                        {item.batchquantity >= item.quantity
                          ? "Còn hàng"
                          : "Hết hàng"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary font-medium border">
                        <input
                          type="checkbox"
                          className="bg-primary text-white px-3 py-1 rounded-md m-2"
                          onChange={() => handleCheckboxChange(item)}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-lg text-center text-primary font-medium border">
                        <button
                          className="bg-red-500 text-white px-4 py-1 rounded-lg m-2 hover:opacity-80"
                          onClick={() => onDeleteCart(item.productid)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* pagination */}
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            )}
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
              handleDeleteCart={handleDeleteCart}
            />
          )}
        </div>
      )}
    </>
  );
}