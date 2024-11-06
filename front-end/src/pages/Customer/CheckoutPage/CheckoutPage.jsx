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
// import { formatDate } from "../../../utils/formatDate";
import { useToast } from "../../../context/ToastContext";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  //set toast khi dat hang thanh cong
  const { setToastMessage } = useToast();

  const { selectedItems } = location.state || { selectedItems: [] };

  // Lấy userid từ localStorage
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;

  const [userInfo, setUserInfo] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  // Lay thong tin user tu userId
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
        item.batchprice * (1 - 0.01 * item.promotion) * item.quantity;
    });
    return Math.round(totalPrice);
  };

  const calculateEstimatedDeliveryTime = () => {
    if (!shippingInfo) return 0; // Add check for shippingInfo existence
    const estimatedDeliveryTime = new Date(
      shippingInfo.estimatedDeliveryTime
    ).getTime();
    const deliveryDistrict = shippingInfo.districtDelivery;

    let adjustedTime;
    if (
      deliveryDistrict.includes("Quận 1") ||
      deliveryDistrict.includes("Quận 3") ||
      deliveryDistrict.includes("Quận 5") ||
      deliveryDistrict.includes("Quận 10") ||
      deliveryDistrict.includes("Quận 4") ||
      deliveryDistrict.includes("Quận Phú Nhuận") ||
      deliveryDistrict.includes("Quận Bình Thạnh")
    ) {
      adjustedTime = new Date(estimatedDeliveryTime - 1 * 60 * 60 * 1000); // subtract 1 hour
    } else if (
      deliveryDistrict.includes("Quận Tân Bình") ||
      deliveryDistrict.includes("Quận Tân Phú") ||
      deliveryDistrict.includes("Quận Gò Vấp") ||
      deliveryDistrict.includes("Quận 8") ||
      deliveryDistrict.includes("Quận 11") ||
      deliveryDistrict.includes("Quận 7")
    ) {
      adjustedTime = new Date(estimatedDeliveryTime + 1 * 60 * 60 * 1000); // add 1 hour
    } else {
      adjustedTime = new Date(estimatedDeliveryTime + 4 * 60 * 60 * 1000); // add 4 hours
    }

    // Làm tròn thời gian theo giờ
    const startOfHour = new Date(adjustedTime);
    startOfHour.setMinutes(0, 0, 0);

    const endOfHour = new Date(startOfHour);
    endOfHour.setHours(startOfHour.getHours() + 1);

    return {
      start: startOfHour,
      end: endOfHour,
    };
  };

  const estimatedDeliveryTime =
    shippingInfo && calculateEstimatedDeliveryTime();

  // Tính phí vận chuyển dựa trên địa chỉ
  const calculateShippingFee = () => {
    if (!shippingInfo) return 0;
    const totalQuantity = selectedItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Giả định: Bạn có thể thay đổi điều kiện này dựa trên thông tin địa chỉ thực tế
    const deliveryDistrict = shippingInfo.districtDelivery;

    // Ví dụ điều kiện để xác định khu vực giao hàng
    if (
      deliveryDistrict.includes("Quận 1") ||
      deliveryDistrict.includes("Quận 3") ||
      deliveryDistrict.includes("Quận 5") ||
      deliveryDistrict.includes("Quận 10") ||
      deliveryDistrict.includes("Quận 4") ||
      deliveryDistrict.includes("Quận Phú Nhuận") ||
      deliveryDistrict.includes("Quận Bình Thạnh")
    ) {
      return 1000 * totalQuantity; // Phí giao hàng cho khu vực 1
    } else if (
      deliveryDistrict.includes("Quận Tân Bình") ||
      deliveryDistrict.includes("Quận Tân Phú") ||
      deliveryDistrict.includes("Quận Gò Vấp") ||
      deliveryDistrict.includes("Quận 8") ||
      deliveryDistrict.includes("Quận 11") ||
      deliveryDistrict.includes("Quận 7")
    ) {
      return 5000 + 1000 * totalQuantity; // Phí giao hàng cho khu vực 2
    } else {
      return 8000 + 1000 * totalQuantity; // Phí giao hàng cho khu vực khác
    }
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
          {Math.round(item.batchprice * (1 - 0.01 * item.promotion))} đ
        </p>
        <p className="w-1/4 text-lg font-semibold text-primary">
          {item.quantity} kg
        </p>
      </div>
    ));
  };

  const [paymentMethod, setPaymentMethod] = useState("");

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
    const totalAmount = calculateTotalPrice() + calculateShippingFee();
    const shippingFee = calculateShippingFee();
    const orderDetails = {
      userId: userId,
      paymentMethod: paymentMethod,
      items: selectedItems,
      shippingAddress: shippingInfo.deliveryAddress,
      estimatedDeliveryTime: shippingInfo.estimatedDeliveryTime,
      batchprice: selectedItems.batchprice,
      totalAmount: totalAmount,
      shippingFee,
      currency: "VND",
    };

    try {
      if (!paymentMethod) {
        toast.error("Vui lòng chọn phương thức thanh toán!");
        return;
      }

      if (paymentMethod === "Thanh toán online") {
        // Gọi API tạo Checkout Session của Stripe
        const response = await axios.post(
          `${API_BASE_URL}/checkout/create-payment-session`,
          orderDetails,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        // Chuyển hướng người dùng đến URL của Stripe Checkout
        window.location.href = response.data.url;
        setToastMessage(response.data.message);
        // navigate("/purchase-history");
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

  return (
    <div className="bg-fourth">
      <HeaderCustomer />
      <div className="w-4/5 mx-auto bg-white rounded-md p-5 mt-36 shadow-2xl">
        <h1 className="font-bold text-primary text-2xl">THÔNG TIN ĐƠN HÀNG</h1>
      </div>
      <div className="w-4/5 mx-auto bg-white rounded-md p-5 py-7 mt-5 flex justify-center shadow-2xl mb-10">
        <div className="w-1/2 justify-between">
          <h1 className="font-bold text-2xl mb-4 text-primary">
            Thông tin sản phẩm
          </h1>
          {InfoOrder()}
        </div>

        <div className="w-5/12 bg-fourth rounded-md flex flex-col justify-start text-center text-primary p-5 shadow-2xl">
          <h1 className="font-bold text-2xl mb-4">Thông tin thanh toán</h1>

          <div className="space-y-2">
            <div className="w-6/12 h-0.5 m-auto bg-primary"></div>
            <div className="">
              <h2 className="font-bold text-xl ml-3 flex">
                Thông tin khách hàng
              </h2>
              <div className="flex items-center ml-5 my-2">
                <p className="font-bold w-1/3 text-left">Tên khách hàng:</p>
                <p className="text-gray-900 w-2/3 text-left font-medium">
                  {userInfo ? userInfo.fullname : ""}
                </p>
              </div>
              <div className="flex items-center ml-5 my-2">
                <p className="font-bold w-1/3 text-left">Số điện thoại:</p>
                <p className="text-gray-900 w-2/3 text-left font-medium">
                  {userInfo ? userInfo.phonenumber : ""}
                </p>
              </div>
              <div className="flex items-center ml-5 my-2">
                <p className="font-bold w-1/3 text-left">Địa chỉ:</p>
                <p className="text-gray-900 w-2/3 text-left font-medium">
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
              <div className="ml-5 my-3 font-medium">
                <div className="flex my-1">
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
                  <p className="text-gray-900 w-7/12 justify-start text-left font-medium">
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
                      className="mx-2 px-4 py-2 rounded-lg bg-primary text-white font-medium"
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </div>
              <div className="my-2 flex">
                <p className="font-bold w-5/12 ml-5 text-left">
                  Thời gian nhận hàng:{" "}
                </p>
                <p className="text-gray-900 w-7/12 justify-start text-left font-medium ml-1">
                  Khoảng{" "}
                  {estimatedDeliveryTime
                    ? `${estimatedDeliveryTime.start.toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        // day: "2-digit",
                        // month: "2-digit",
                        // year: "numeric",
                      })} - ${estimatedDeliveryTime.end.toLocaleString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          // day: "2-digit",
                          // month: "2-digit",
                          // year: "numeric",
                        }
                      )} ngày ${estimatedDeliveryTime.end.toLocaleString(
                        "vi-VN",
                        {
                          // hour: "2-digit",
                          // minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="w-11/12  h-0.5 m-auto bg-primary"></div>
            <div className="">
              <h2 className="font-bold text-xl ml-3 flex">Tóm tắt đơn hàng</h2>
              <div className="flex items-center ml-5 my-3">
                <p className="font-bold w-1/3 text-left">Tạm tính:</p>
                <p className="text-gray-900 w-2/3 text-left font-bold">
                  {calculateTotalPrice()} đ
                </p>
              </div>
              <div className="flex items-center ml-5 my-3">
                <p className="font-bold w-1/3 text-left">Phí vận chuyển:</p>
                <p className="text-gray-900 w-2/3 text-left font-bold">
                  {calculateShippingFee()} đ
                </p>
              </div>
              <div className="flex items-center ml-5 my-3">
                <p className="font-bold  w-1/3 text-left">Tổng cộng:</p>
                <p className="text-gray-900 w-2/3 text-left font-bold">
                  {calculateTotalPrice() + calculateShippingFee()} đ
                </p>
              </div>
            </div>

            <button
              className="bg-primary text-white py-2 px-5 rounded-lg w-5/6 mt-5 hover:opacity-80 transition duration-300 font-bold"
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

export default CheckoutPage;
