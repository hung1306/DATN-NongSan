import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../../config/config";
import { useToast } from "../../../context/ToastContext";
import { jwtDecode } from "jwt-decode";
import Loading from "../../../components/Loading.jsx";

const LoginCustomer = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toastMessage, setToastMessage } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Xóa token khỏi localStorage nếu có
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  useEffect(() => {
    if (toastMessage) {
      toast.success(toastMessage, {
        position: "top-right",
        time: 500,
      });
      setToastMessage(null);
    }
  }, [toastMessage, setToastMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Kiểm tra nếu username/email và password không rỗng
    if (!credentials.usernameOrEmail || !credentials.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials
      );
      // Hiển thị thông báo đăng nhập thành công
      if (response.status === 200) {
        //lay token và giai ma token
        const decodedToken = jwtDecode(response.data.accessToken);
        const role = decodedToken?.role;
        if (role !== "customer") {
          toast.error("Đây không phải là tài khoản khách hàng");
          setLoading(false);
          return;
        }

        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        setToastMessage("Đăng nhập thành công");
        callProtectedApi();
        // Điều hướng người dùng đến trang chính
        navigate("/");
      }
      // De tranh loi thoi
      if (response.status === 201) getAuthToken();
    } catch (error) {
      // Hiển thị thông báo đăng nhập thất bại
      toast.error(error.response.data, {
        position: "top-right",
        time: 500,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });
      localStorage.setItem("accessToken", response.data.token);
      return response.data.accessToken;
    } catch (error) {
      console.error("Refresh token error:", error);
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
        position: "top-right",
        time: 500,
      });
      navigate("/login");
    }
  };

  const getAuthToken = async () => {
    let token = localStorage.getItem("accessToken");
    // Check if token is expired and refresh if necessary
    if (isTokenExpired(token)) {
      token = await refreshToken();
    }
    return token;
  };
  const isTokenExpired = (token) => {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  };

  // Hàm để gọi API với Bearer token
  const callProtectedApi = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.", {
        position: "top-right",
        time: 500,
      });
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/protected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Protected data:", response.data);
    } catch (error) {
      console.error("Error calling protected API:", error);

      if (error.response && error.response.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          position: "top-right",
          time: 500,
        });
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.", {
          position: "top-right",
          time: 500,
        });
      }
    }
  };

  return (
    <div className="backgroundImg">
      <ToastContainer />
      {loading ? (
        <Loading /> // Display loading spinner when loading is true
      ) : (
        <div className="w-1/3 m-auto bg-fourth rounded-2xl shadow-2xl px-2 py-4">
          <h1 className="text-primary py-3 font-bold text-center text-3xl">
            Đăng Nhập
          </h1>

          <div className="p-3 my-2">
            <div className="bg-secondary mx-2 rounded-t-xl p-4 shadow-xl">
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
            <div className="bg-secondary mx-2 rounded-b-xl px-4 shadow-xl">
              <label
                htmlFor="usernameOrEmail"
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
              <div className="flex justify-between my-3 pb-3">
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

          <div className="flex items-center flex-col mx-5 mb-3">
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-primary hover:opacity-90 text-white font-bold py-2 px-4 m-2 rounded-xl w-full"
            >
              Đăng nhập
            </button>
            <p className="text-primary text-xl m-2 font-bold">Hoặc</p>
            <button
              className="bg-third hover:opacity-90 text-white font-bold py-2 px-4 m-2 rounded-xl w-full cursor-not-allowed"
              disabled
            >
              Đăng nhập với google
            </button>
            <p className="text-primary">
              Bạn chưa có tài khoản?{" "}
              <Link className="text-third" to="/register/step1">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginCustomer;
