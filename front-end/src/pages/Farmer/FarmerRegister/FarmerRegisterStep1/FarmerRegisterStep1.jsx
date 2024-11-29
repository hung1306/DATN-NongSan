import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faShoppingCart,
  faCheckCircle,
  faEyeSlash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import "../../../../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { API_BASE_URL } from "../../../../config/config";
import { useToast } from "../../../../context/ToastContext";
import Loading from "../../../../components/Loading";

function FarmerRegisterStep1() {
  // Khởi tạo các biến và cách nhập
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [dob, setDob] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [indentitycard, setIndentitycard] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [street, setStreet] = useState("");
  const [commune, setCommune] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [avatar, setAvatar] = useState(null);

  // khởi tạo tb lỗi
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [fullnameError, setFullnameError] = useState("");
  const [phonenumberError, setPhonenumberError] = useState("");
  const [indentitycardError, setIndentitycardError] = useState("");
  const [dobError, setDobError] = useState("");
  const [streetError, setStreetError] = useState("");
  const [communeError, setCommuneError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [provinceError, setProvinceError] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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
      setConfirmPasswordError(
        "Xác nhận mật khẩu là bắt buộc hoặc mật khẩu không khớp"
      );
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
    if (indentitycard === "") {
      setIndentitycardError("CCCD/CMND là bắt buộc");
      isValid = false;
    } else {
      setIndentitycardError("");
    }
    if (dob === "") {
      setDobError("Ngày sinh là bắt buộc");
      isValid = false;
    } else {
      setDobError("");
    }
    if (phonenumber === "") {
      setPhonenumberError("Số điện thoại là bắt buộc");
      isValid = false;
    } else {
      setPhonenumberError("");
    }

    if (!street) {
      setStreetError("Tên đường là bắt buộc");
      isValid = false;
    } else {
      setStreetError("");
    }

    if (!commune) {
      setCommuneError("Tên phường/xã là bắt buộc");
      isValid = false;
    } else {
      setCommuneError("");
    }

    if (!district) {
      setDistrictError("Quận/Huyện là bắt buộc");
      isValid = false;
    } else {
      setDistrictError("");
    }

    if (!province) {
      setProvinceError("Tỉnh/Thành phố là bắt buộc");
      isValid = false;
    } else {
      setProvinceError("");
    }

    if (!avatar) {
      setAvatarError("Ảnh đại diện là bắt buộc");
      isValid = false;
    } else {
      setAvatarError("");
    }
    return isValid;
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  // Xử lý hiện thị password khi nhập
  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const { setToastMessage } = useToast();
  //Xử lý bước tiếp theo
  const handleNext = async () => {
    try {
      if (!validate()) {
        return;
      }
      setLoading(true);
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("fullname", fullname);
      formData.append("dob", dob);
      formData.append("phonenumber", phonenumber);
      formData.append("indentitycard", indentitycard);
      formData.append("street", street);
      formData.append("commune", commune);
      formData.append("district", district);
      formData.append("province", province);
      if (avatar) {
        formData.append("avatar", avatar);
      }
      formData.append("role", "farmer");
      formData.append("status", "false");

      // Gửi yêu cầu API cho giai đoạn 1 (nhập thông tin cơ bản)
      const response = await axios.post(
        `${API_BASE_URL}/auth/farmer/register/step1`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const userId = response.data.userid;
      // Điều hướng sang trang nhập thông tin phụ
      setToastMessage(
        "Đăng ký tài khoản thành công, nhập thông tin trang trại để hoàn tất đăng ký!"
      );
      navigate(`/farmer/register/step2?userid=${userId}`);
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-fourth flex flex-col">
      <ToastContainer />
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loading />
        </div>
      ) : (
        <>
          <div className="bg-fourth px-10 py-3">
            <div className="bg-white ml-10 mr-10  flex flex-col py-2 rounded-xl shadow-2xl">
              <p className="text-center text-2xl text-primary font-bold p-2">
                ĐĂNG KÝ ĐỂ ĐƯA NÔNG SẢN CỦA BẠN ĐẾN VỚI NGƯỜI TIÊU DÙNG KHẮP NƠI
                TRÊN LÃNH THỔ VIỆT NAM
              </p>
            </div>

            {/* Register form */}
            <div className="bg-white mt-5 ml-10 mr-10 flex justify-center py-10 rounded-xl  shadow-2xl">
              {/* Icon tài khoản */}
              <div className="mr-40 relative flex flex-col items-center">
                {/* Icon */}
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-green-600 text-4xl"
                />
                <p className="text-center text-green-600 mt-2 font-bold">
                  Đăng ký tài khoản
                </p>
                {/* Đường kẻ */}
                <div className="absolute top-1/2 left-full transform -translate-y-1/2 h-0.5 bg-gray-900 w-40"></div>
              </div>

              {/* Icon giỏ hàng */}
              <div className="mr-40 relative flex flex-col items-center">
                {/* Icon */}
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  className="text-gray-900 text-4xl"
                />
                <p className="text-center mt-2">Đăng ký trang trại</p>
                {/* Đường kẻ */}
                <div className="absolute top-1/2 left-full transform -translate-y-1/2 h-0.5 bg-gray-900 w-40"></div>
              </div>

              {/* Icon hoàn thành */}
              <div className="relative flex flex-col items-center">
                {/* Icon */}
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-gray-900 text-4xl"
                />
                <p className="text-center mt-2">Hoàn thành</p>
              </div>
            </div>

            {/* Nhập thông tin */}
            <div className="flex ml-10 mr-10 mb-5 py-5 px-10 rounded-xl">
              {/* Left Block - Form */}
              <div className="w-1/2 bg-white p-10 rounded-lg text-white  shadow-2xl">
                <div className="w-full pr-4">
                  <div className="mb-3">
                    <label
                      htmlFor="email"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Email:
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {emailError && (
                      <p className="text-red-500 text-sm italic">
                        {emailError}
                      </p> // Changed to red
                    )}
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="username"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Tên đăng nhập:
                    </label>
                    <input
                      type="text"
                      id="username"
                      placeholder="Tên đăng nhập"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {usernameError && (
                      <p className="text-red-500 text-sm italic">
                        {usernameError}
                      </p> // Changed to red
                    )}
                  </div>
                  <div className="mb-3 relative">
                    <label
                      htmlFor="password"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Mật khẩu:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-fourth rounded-xl py-2 px-3 w-full bg-ebffeb text-gray-900 pr-10" // Add padding to the right
                      />
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        onClick={handlePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-900"
                      />
                    </div>
                    {passwordError && (
                      <p className="text-red-500  text-sm italic">
                        {passwordError}
                      </p> // Changed to red
                    )}
                  </div>
                  <div className="mb-3 relative">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Xác nhận mật khẩu:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border border-fourth rounded-xl py-2 px-3 w-full text-primary pr-10" // Add padding to the right
                      />
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        onClick={handlePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-900"
                      />
                    </div>
                    {confirmPasswordError && (
                      <p className="text-red-500 text-sm italic">
                        {confirmPasswordError}
                      </p> // Changed to red
                    )}
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="fullname"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Tên đầy đủ:
                    </label>
                    <input
                      type="text"
                      id="fullname"
                      placeholder="Tên đầy đủ"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {fullnameError && (
                      <p className="text-red-500 italic text-sm">
                        {fullnameError}
                      </p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="dob"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Ngày sinh:
                    </label>
                    <input
                      type="date"
                      id="dob"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="border border-fourth rounded-xl py-1 px-2 w-full text-primary"
                    />
                    {dobError && (
                      <p className="text-red-500 italic text-sm">{dobError}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="phonenumber"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Số điện thoại:
                    </label>
                    <input
                      type="text"
                      id="phonenumber"
                      placeholder="Số điện thoại"
                      value={phonenumber}
                      onChange={(e) => setPhonenumber(e.target.value)}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {phonenumberError && (
                      <p className="text-red-500 italic text-sm">
                        {phonenumberError}
                      </p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="indentitycard"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Số CMND/CCCD:
                    </label>
                    <input
                      type="text"
                      id="indentitycard"
                      placeholder="Số CMND/CCCD:"
                      value={indentitycard}
                      onChange={(e) => setIndentitycard(e.target.value)}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {indentitycardError && (
                      <p className="text-red-500 text-sm italic">
                        {indentitycardError}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="avatar"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Chọn ảnh đại diện:
                    </label>
                    <input
                      type="file"
                      id="avatar"
                      placeholder="Chọn ảnh đại diện"
                      onChange={handleFileChange}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {avatarError && (
                      <p className="text-red-500 text-sm italic">
                        {avatarError}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="street"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Tên đường:
                    </label>
                    <input
                      type="text"
                      id="street"
                      placeholder="Tên đường"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {streetError && (
                      <p className="text-red-500 text-sm italic">
                        {streetError}
                      </p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="commune"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Tên phường/xã:
                    </label>
                    <input
                      type="text"
                      id="commune"
                      placeholder="Phường/xã"
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {communeError && (
                      <p className="text-red-500 text-sm italic">
                        {communeError}
                      </p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="district"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Tên quận/huyện:
                    </label>
                    <input
                      type="text"
                      id="district"
                      placeholder="Quận/Huyện"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {districtError && (
                      <p className="text-red-500 text-sm italic">
                        {districtError}
                      </p> // Changed to red
                    )}
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="province"
                      className="block text-primary font-bold mb-2 text-sm"
                    >
                      Tên tỉnh/thành phố:
                    </label>
                    <input
                      type="text"
                      id="province"
                      placeholder="Tỉnh/Thành phố"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="border border-fourth rounded-xl py-2 px-3 w-full text-primary"
                    />
                    {provinceError && (
                      <p className="text-red-500 text-sm italic">
                        {provinceError}
                      </p> // Changed to red
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleNext}
                      className="bg-primary text-white font-bold py-3 px-5 rounded-2xl w-full my-3"
                    >
                      Tiếp tục
                    </button>
                  </div>
                  <p className="text-center text-primary font-bold">Hoặc</p>
                  <button
                    onClick={handleNext}
                    className="bg-white text-gray-600 border-2 border-fourth font-bold py-2 px-4 rounded-2xl w-full my-3 cursor-not-allowed"
                    disabled
                  >
                    Đăng ký với Google
                  </button>
                  <div className="flex justify-center">
                    <p className="text-gray-600 mt-4">
                      Đã có tài khoản bán hàng?{" "}
                      <a
                        href="/farmer/login"
                        className="text-green-500 font-bold"
                      >
                        Đăng nhập
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Block - Image */}
              <div className="w-1/2 flex flex-col justify-start items-center p-6 mt-20">
                <div className="mb-4 text-center">
                  <p className="font-bold text-2xl text-primary">
                    ĐĂNG KÝ BÁN HÀNG CÙNG AGRIMART
                  </p>
                  <p className="text-primary mt-2 text-xl font-semibold">
                    Với mục tiêu tiếp cận hàng ngàn khách hàng, tăng cường
                    thương hiệu nông trại và nâng cao doanh thu, đồng thời góp
                    phần xây dựng nền nông nghiệp bền vững
                  </p>
                </div>
                <img
                  src="/src/assets/logimFarmer.jpg"
                  alt="Đăng ký"
                  className="rounded-lg w-3/4 h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FarmerRegisterStep1;
