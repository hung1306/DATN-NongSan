import { useLocation, useNavigate } from "react-router-dom";
import HeaderCustomer from "../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import FooterCustomer from "./../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config";
import { jwtDecode } from "jwt-decode";
import { getUserInfo } from "../../../service/CustomerService/userService";
import { useEffect, useState } from "react";
import { getShippingInfo } from "../../../service/CustomerService/checkoutService";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/formatDate";
import { useToast } from "../../../context/ToastContext";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Khởi tạo Stripe với Publishable Key của bạn
const stripePromise = loadStripe(
  "pk_test_51Q60zuLnoPrvRvUrrUcNQXTJ2J2uQLrR8TVVP42qNwAN3z5KEd4uk6W7IhWdrmSfhrKWyb3bX4Q1RI7xX9roDWrP00tHgppJjY"
);

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // set toast khi dat hang thanh cong
  const { setToastMessage } = useToast();

  const { selectedItems } = location.state || { selectedItems: [] };

  // Lấy userid từ localStorage
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;
  // const orderId = decodedToken.orderid;
  // console.log(orderId);

  const [userInfo, setUserInfo] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  // Lấy thông tin user từ userId
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getUserInfo(userId);
        setUserInfo(user);
        const shipping = await getShippingInfo(userId);
        setShippingInfo(shipping);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };
    fetchUserInfo();
  }, [userId]);

  const calculateTotalPrice = () => {
    let totalPrice = 0;
    selectedItems.forEach((item) => {
      totalPrice +=
        item.productprice * (1 - 0.01 * item.promotion) * item.quantity;
    });
    return totalPrice;
  };

  const InfoOrder = () => {
    return selectedItems.map((item) => (
      <div
        key={item.productid}
        className="flex w-full justify-between items-center p-4 border-b border-gray-200"
      >
        <img
          src={item.productimage1}
          alt={item.productname1}
          className="w-1/5 object-cover rounded"
        />
        <h3 className="w-1/4 text-lg font-bold text-primary ml-2">
          {item.productname}
        </h3>
        <p className="w-1/4 text-lg font-semibold text-primary">
          {item.productprice} VNĐ
        </p>
        <p className="w-1/4 text-lg font-semibold text-primary">
          {item.quantity}
        </p>
      </div>
    ));
  };

  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  // Edit shipping address
  const [isEditing, setIsEditing] = useState(false);
  const [newAddress, setNewAddress] = useState(
    shippingInfo ? shippingInfo.deliveryAddress : ""
  );

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setNewAddress(e.target.value);
  };

  const handleSaveClick = () => {
    if (!newAddress) {
      toast.error("Địa chỉ mới không đc để trống!");
      return;
    }
    setShippingInfo({ ...shippingInfo, deliveryAddress: newAddress });
    setIsEditing(false);
  };

  const handleCheckout = async () => {
    const totalAmount = calculateTotalPrice();
    const orderDetails = {
      userId: userId,
      paymentMethod: paymentMethod,
      items: selectedItems,
      shippingAddress: shippingInfo.deliveryAddress,
      estimatedDeliveryTime: shippingInfo.estimatedDeliveryTime,
      amount: totalAmount,
      currency: "VND",
    };

    try {
      if (!paymentMethod) {
        toast.error("Vui lòng chọn phương thức thanh toán!");
        return;
      }

      if (paymentMethod === "Thanh toán online") {
        // Gọi API tạo Payment Intent từ backend
        const response = await axios.post(
          `${API_BASE_URL}/checkout/create-payment-intent`,
          orderDetails,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const { clientSecret, orderId } = response.data; // Nhận orderId từ response

        console.log("Order ID from server:", orderId);

        // Xác thực thanh toán với Stripe
        const cardElement = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
            },
          }
        );

        if (error) {
          toast.error("Thanh toán thất bại, vui lòng thử lại!");
          console.error("Payment failed:", error);
        } else if (paymentIntent.status === "succeeded") {
          toast.success("Thanh toán thành công!");

          // Sau khi thanh toán thành công, gọi API lưu thông tin vào database
          await axios.post(
            `${API_BASE_URL}/checkout/save-payment-info`,
            {
              userId: userId,
              orderId: orderId, // Đảm bảo bạn có orderId trong dữ liệu đơn hàng
              paymentId: paymentIntent.paymentid,
              amount: totalAmount,
              paymentMethod: paymentMethod,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // Chuyển hướng đến trang lịch sử mua hàng
          navigate("/purchase-history");
        }
      } else {
        // Xử lý thanh toán khi nhận hàng
        const response = await axios.post(
          `${API_BASE_URL}/checkout`,
          orderDetails,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setToastMessage(response.data.message);
        navigate("/purchase-history");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Đặt hàng thất bại, vui lòng thử lại!");
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#333", // Darker text color for clearer visibility
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: "18px", // Slightly larger font size
        fontWeight: "500",
        "::placeholder": {
          color: "#999", // Clearer placeholder color
        },
        backgroundColor: "#f9f9f9", // Light background for better contrast
        padding: "12px", // Add padding for a more spacious look
        borderRadius: "6px",
        border: "2px solid #ccc", // Thicker border for visibility
        margin: "8px 0",
      },
      invalid: {
        color: "#e63946", // Error color for invalid inputs
        iconColor: "#e63946",
      },
      complete: {
        color: "#4caf50", // Success color for complete inputs
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="bg-fourth">
      <HeaderCustomer />
      <div className="w-4/5 mx-auto bg-white rounded-md p-5 mt-32">
        <h1 className="font-bold text-primary text-2xl">THÔNG TIN ĐƠN HÀNG</h1>
      </div>
      <div className="w-4/5 mx-auto bg-white rounded-md p-5 mt-5 flex justify-center">
        <div className="w-1/2 justify-between">{InfoOrder()}</div>

        <div className="w-1/3 bg-fourth rounded-sm flex flex-col justify-start text-center text-primary p-3">
          <h1 className="font-bold text-xl mb-4">THÔNG TIN THANH TOÁN</h1>

          <div className="space-y-2">
            <div className="w-6/12 h-0.5 m-auto bg-primary"></div>
            <div className="">
              <h2 className="font-bold text-xl ml-3 flex">
                Thông tin khách hàng
              </h2>
              <div className="flex items-center ml-5 my-2">
                <p className="font-bold w-1/3 text-left">Tên khách hàng:</p>
                <p className="text-gray-900 w-2/3 text-left">
                  {userInfo ? userInfo.fullname : ""}
                </p>
              </div>
              <div className="flex items-center ml-5 my-2">
                <p className="font-bold w-1/3 text-left">Số điện thoại:</p>
                <p className="text-gray-900 w-2/3 text-left">
                  {userInfo ? userInfo.phonenumber : ""}
                </p>
              </div>
              <div className="flex items-center ml-5 my-2">
                <p className="font-bold w-1/3 text-left">Địa chỉ:</p>
                <p className="text-gray-900 w-2/3 text-left">
                  {userInfo
                    ? userInfo.street +
                      ", " +
                      userInfo.commune +
                      ", " +
                      userInfo.district +
                      ", " +
                      userInfo.province
                    : ""}
                </p>
              </div>
            </div>
            <div className="w-11/12  h-0.5 m-auto bg-primary"></div>
            <div className="">
              <h2 className="font-bold text-xl ml-3 flex">
                Chọn phương thức thanh toán
              </h2>
              <div className="ml-5 my-3">
                <div className="flex  my-1">
                  <input
                    type="radio"
                    name="payment"
                    id="payment1"
                    value="Thanh toán khi nhận hàng"
                    className="w-4"
                    onChange={handlePaymentChange}
                  />
                  <p className="ml-2">Thanh toán khi nhận hàng</p>
                </div>
                <div className="flex my-1">
                  <input
                    type="radio"
                    name="payment"
                    id="payment2"
                    value="Thanh toán online"
                    className="w-4"
                    onChange={handlePaymentChange}
                  />
                  <p className="ml-2">Thanh toán online</p>
                </div>
              </div>
            </div>

            <div className="w-11/12  h-0.5 m-auto bg-primary"></div>
            <div className="">
              <h2 className="font-bold text-xl ml-3 flex">
                Thông tin vận chuyển
              </h2>
              <div className="my-2 flex">
                <p className="font-bold w-5/12 ml-5 text-left">
                  Địa chỉ nhận hàng:
                </p>
                {!isEditing && (
                  <p className="text-gray-900 w-7/12 justify-start text-left">
                    {shippingInfo ? shippingInfo.deliveryAddress : ""}
                    <button
                      className="ml-2 text-primary"
                      onClick={handleEditClick}
                    >
                      Thay đổi
                    </button>
                  </p>
                )}
                {isEditing && (
                  <div className="flex w-7/12">
                    <input
                      type="text"
                      value={newAddress}
                      placeholder="Nhập địa chỉ mới"
                      onChange={handleInputChange}
                      className="border-collapse p-2 rounded-lg"
                    />
                    <button
                      onClick={handleSaveClick}
                      className="ml-2 p-2 rounded-lg bg-primary text-white"
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </div>
              <div className="my-2 flex">
                <p className="font-bold w-5/12 ml-5 text-left">
                  Thời gian nhận hàng:
                </p>
                <p className="text-gray-900 w-7/12 justify-start text-left">
                  {shippingInfo
                    ? formatDate(shippingInfo.estimatedDeliveryTime)
                    : ""}
                </p>
              </div>
            </div>

            <div className="w-11/12  h-0.5 m-auto bg-primary"></div>
            <div className="">
              <h2 className="font-bold text-xl ml-3 flex">Tóm tắt đơn hàng</h2>
              <div className="flex items-center ml-5 my-3">
                <p className="font-bold w-1/3 text-left">Tổng tiền:</p>
                <p className="text-gray-900 w-2/3 text-left font-bold">
                  {calculateTotalPrice()} VNĐ
                </p>
              </div>
              <div className="flex items-center ml-5 my-3">
                <p className="font-bold w-1/3 text-left">Phí vận chuyển:</p>
                <p className="text-gray-900 w-2/3 text-left font-bold">0 VNĐ</p>
              </div>
              <div className="flex items-center ml-5 my-3">
                <p className="font-bold  w-1/3 text-left">Tổng cộng:</p>
                <p className="text-gray-900 w-2/3 text-left font-bold">
                  {calculateTotalPrice()} VNĐ
                </p>
              </div>
            </div>

            {paymentMethod === "Thanh toán online" && (
              <div className="my-5">
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Thông tin thẻ
                </label>
                <div className="border border-gray-300 rounded-lg p-3">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>
            )}

            <button
              className="bg-primary text-white p-2 rounded-md w-2/3 mt-5 hover:opacity-80 transition duration-300"
              onClick={handleCheckout}
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>

      <FooterCustomer />
    </div>
  );
};

const WrappedCheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutPage />
  </Elements>
);

export default WrappedCheckoutPage;
