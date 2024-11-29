import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../../../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../../../../config/config";
import { toast, ToastContainer } from "react-toastify";
import { useToast } from "../../../../context/ToastContext";
import { useLoading } from "../../../../context/LoadingContext";
import Loading from "../../../../components/Loading";

const RegisterCustomerStep1 = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [fullnameError, setFullnameError] = useState("");
  const [phonenumberError, setPhonenumberError] = useState("");

  const navigate = useNavigate();
  const { setToastMessage } = useToast();
  const { loading, setLoading } = useLoading();

  const validate = () => {
    let isValid = true;
    if (username === "") {
      setUsernameError("Tên đăng nhập là bắt buộc");
      isValid = false;
    } else {
      setUsernameError("");
    }
    if (email === "") {
      setEmailError("Email là bắt buộc");
      isValid = false;
    } else {
      setEmailError("");
    }
    if (password === "") {
      setPasswordError("Mật khẩu là bắt buộc");
      isValid = false;
    } else {
      setPasswordError("");
    }
    if (confirmPassword === "" || confirmPassword !== password) {
      setConfirmPasswordError("Mật khẩu không khớp");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    if (fullname === "") {
      setFullnameError("Họ và tên là bắt buộc");
      isValid = false;
    } else {
      setFullnameError("");
    }
    if (phonenumber === "") {
      setPhonenumberError("Số điện thoại là bắt buộc");
      isValid = false;
    } else {
      setPhonenumberError("");
    }
    return isValid;
  };

  const handleNext = async () => {
    try {
      if (!validate()) {
        return;
      }
      setLoading(true);
      const userData = {
        username,
        email,
        password,
        fullname,
        phonenumber,
        role: "customer",
        status: "false",
      };

      // Gửi yêu cầu API cho giai đoạn 1 (nhập thông tin cơ bản)
      const response = await axios.post(
        `${API_BASE_URL}/auth/register/step1`,
        userData
      );
      const userId = response.data.userid;
      // Điều hướng sang trang nhập thông tin phụ
      setToastMessage("Đăng ký bước 1 thành công, nhập các thông tin bước 2 để hoàn tất!");
      navigate(`/register/step2?userid=${userId}`);
    } catch (error) {
      console.error(error);
      toast.error(error.response.data); 
    }
    finally {
      setLoading(false);
    }
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <ToastContainer />
      {loading ? (
        <div className="flex justify-center items-center h-screen w-full">
          <Loading />
        </div>
      ) : (
        <>
          <div className="backgroundImg">
            
            <div className="w-1/2 m-auto bg-fourth rounded-2xl px-2 py-4 shadow-2xl">
              <h1 className="text-primary py-3 font-bold text-center text-3xl">
                Đăng ký tài khoản khách hàng
              </h1>
              <div className="flex justify-center px-5 my-3">
                <div className="bg-secondary w-6/12 mx-2 rounded-xl p-3 shadow-xl">
                  <label
                    htmlFor="username"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Tên đăng nhập:
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-fourth"
                  />
                  {usernameError && <p className="text-red-500 italic">{usernameError}</p>}
                </div>

                <div className="bg-secondary w-6/12 mx-2 rounded-xl p-3 shadow-xl">
                  <label
                    htmlFor="email"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Email:
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-fourth"
                  />
                  {emailError && <p className="text-red-500 italic">{emailError}</p>}
                </div>
              </div>

              <div className="flex justify-center px-5 my-3">
                <div className="bg-secondary w-6/12 mx-2 rounded-xl p-3 shadow-xl">
                  <label
                    htmlFor="password"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Mật khẩu:
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-fourth"
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      onClick={handlePasswordVisibility}
                      className="absolute right-3 top-3 cursor-pointer"
                    />
                  </div>
                  {passwordError && <p className="text-red-500 italic">{passwordError}</p>}
                </div>
                <div className="bg-secondary w-6/12 mx-2 rounded-xl p-3 shadow-xl">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Xác nhận mật khẩu:
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-fourth"
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      onClick={handlePasswordVisibility}
                      className="absolute right-3 top-3 cursor-pointer"
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-red-500 italic">{confirmPasswordError}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center px-5 my-3">
                <div className="bg-secondary w-6/12 mx-2 rounded-xl p-3 shadow-xl">
                  <label
                    htmlFor="phonenumber"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Số điện thoại:
                  </label>
                  <input
                    id="phonenumber"
                    type="text"
                    placeholder="Số điện thoại"
                    value={phonenumber}
                    onChange={(e) => setPhonenumber(e.target.value)}
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-fourth"
                  />
                  {phonenumberError && (
                    <p className="text-red-500 italic">{phonenumberError}</p>
                  )}
                </div>
                <div className="bg-secondary w-6/12 mx-2 rounded-xl p-3 shadow-xl">
                  <label
                    htmlFor="fullname"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Họ và tên:
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Họ và tên"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-fourth"
                  />
                  {fullnameError && <p className="text-red-500 italic">{fullnameError}</p>}
                </div>
              </div>
              <div className="flex items-center flex-col m-3">
                <button
                  onClick={handleNext}
                  className="bg-primary hover:opacity-90 text-white font-bold text-xl py-3 px-6 m-2 rounded-xl w-1/2 shadow-xl"
                >
                  Tiếp theo
                </button>
                <p className="text-primary text-xl m-2">Hoặc</p>
                <button
                  onClick={handleNext}
                  className="bg-third hover:opacity-90 text-white font-bold text-xl py-3 px-6 m-2 rounded-xl w-1/2 cursor-not-allowed shadow-xl"
                  disabled
                >
                  Đăng ký với google
                </button>
                <p className="text-primary">
                  Bạn đã có tài khoản?{" "}
                  <Link className="text-third" to="/login">
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RegisterCustomerStep1;