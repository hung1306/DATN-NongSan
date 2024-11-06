import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import imgLogin from "../../../assets/loginShipper.jpg"; // Đổi hình ảnh cho shipper
import { API_BASE_URL } from "../../../config/config";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { jwtDecode } from "jwt-decode";
import Loading from "../../../components/Loading";

export default function ShipperLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const { toastMessage, setToastMessage } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    if (toastMessage) {
      toast.success(toastMessage);
      setToastMessage(null);
    }
  }, [toastMessage, setToastMessage]);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.usernameOrEmail || !credentials.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập.", {
        position: "top-right",
        time: 500,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials // Giả định rằng API đăng nhập cho shipper khác với farmer
      );

      if (response.status === 200) {
        const decodedToken = jwtDecode(response.data.accessToken);
        const role = decodedToken?.role;
        if (role !== "shipper") {
          toast.error("Đây không phải là tài khoản shipper");
          setLoading(false);
          return;
        }

        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        setToastMessage("Đăng nhập thành công");
        navigate("/shipper"); // Điều hướng đến trang chính của shipper
      }
    } catch (error) {
      toast.error(error.response?.data || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-fourth p-2 flex items-center justify-center">
      <ToastContainer />
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loading />
        </div>
      ) : (
        <div className="w-2/3 m-auto shadow-lg bg-secondary rounded-2xl flex">
          <div className="text-primary w-2/3 flex items-center justify-center">
            <div className="w-11/12 h-1/3 m-auto flex flex-col justify-center">
              <h2 className="text-3xl text-center font-bold my-3 pt-5">
                TRỞ THÀNH NGƯỜI GIAO HÀNG THÂN THIỆN, DỄ MẾN VỚI AGRIMART
              </h2>
              <div className="ml-5 mb-3 text-center text-lg font-medium">
                Cung cấp dịch vụ giao hàng của bạn trên hệ thống của chúng tôi.
                Đăng nhập ngay để trở thành đối tác giao hàng của chúng tôi.
              </div>
              <img
                src={imgLogin}
                alt="shipper"
                className="w-7/12 m-auto my-2 rounded-lg"
              />
            </div>
          </div>
          <div className="w-1/3 shadow-2xl">
            <h1 className="text-primary pt-5 font-bold text-center text-3xl">
              Đăng Nhập
            </h1>
            <div className="my-2">
              <div className="bg-secondary mx-2 rounded-t-xl p-2">
                <label
                  htmlFor="usernameOrEmail"
                  className="block text-xl text-primary font-bold mb-2"
                >
                  Tên đăng nhập hoặc email
                </label>
                <input
                  type="text"
                  placeholder="Tên đăng nhập hoặc email"
                  name="usernameOrEmail"
                  value={credentials.usernameOrEmail}
                  onChange={handleChange}
                  className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-fourth"
                />
              </div>
              <div className="bg-secondary mx-2 rounded-b-xl p-2">
                <label
                  htmlFor="password"
                  className="block text-xl text-primary font-bold mb-2"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    value={credentials.password}
                    onChange={handleChange}
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-fourth"
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    onClick={handlePasswordVisibility}
                    className="absolute right-3 top-3 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between my-3">
                  <div>
                    <input type="checkbox" className="mr-2" />
                    <label className="text-primary">Ghi nhớ mật khẩu</label>
                  </div>
                  <a href="/forgot-password" className="text-primary">
                    Quên mật khẩu?
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-col mx-5 mb-5">
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-primary hover:opacity-90 text-white font-bold py-2 px-4 m-3 rounded-xl w-full"
              >
                Đăng nhập
              </button>
              <p className="text-primary text-xl m-2 font-bold">Hoặc</p>
              <button className="bg-third hover:opacity-90 text-white font-bold py-2 px-4 m-3 rounded-xl w-full">
                Đăng nhập với Google
              </button>
              <p className="text-primary">
                Bạn chưa có tài khoản?{" "}
                <Link className="text-third" to="/shipper/register">
                  Đăng ký
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
