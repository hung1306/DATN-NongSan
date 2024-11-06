import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../../../config/config";
import { toast, ToastContainer } from "react-toastify";
import { useToast } from "../../../context/ToastContext";
import { useLoading } from "../../../context/LoadingContext";
import Loading from "../../../components/Loading";

const ShipperRegister = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [street, setStreet] = useState("");
  const [commune, setCommune] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [identitycard, setIdentitycard] = useState("");
  const [avatar, setAvatar] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const [shipperstatus, setShiperStatus] = useState("");
  const [deliveryarea, setDeliveryArea] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [fullnameError, setFullnameError] = useState("");
  const [phonenumberError, setPhonenumberError] = useState("");
  const [identitycardError, setIdentitycardError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [dobError, setDobError] = useState("");
  const [streetError, setStreetError] = useState("");
  const [communeError, setCommuneError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [provinceError, setProvinceError] = useState("");
  // const [shipperstatusError, setShiperstatusError] = useState("");
  const [deliveryareaError, setDeliveryareaError] = useState("");

  const navigate = useNavigate();
  const { setToastMessage } = useToast();
  const { loading, setLoading } = useLoading();

  const validate = () => {
    let isValid = true;

    // Validate username
    if (username === "") {
      setUsernameError("Tên đăng nhập là bắt buộc");
      isValid = false;
    } else {
      setUsernameError("");
    }

    // Validate email
    if (email === "") {
      setEmailError("Email là bắt buộc");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validate password
    if (password === "") {
      setPasswordError("Mật khẩu là bắt buộc");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // Validate confirm password
    if (confirmPassword === "" || confirmPassword !== password) {
      setConfirmPasswordError("Mật khẩu không khớp");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    // Validate fullname
    if (fullname === "") {
      setFullnameError("Họ và tên là bắt buộc");
      isValid = false;
    } else {
      setFullnameError("");
    }

    // Validate phonenumber
    if (phonenumber === "") {
      setPhonenumberError("Số điện thoại là bắt buộc");
      isValid = false;
    } else {
      setPhonenumberError("");
    }

    if (identitycard === "") {
      setIdentitycardError("Số CCCD/CMND là bắt buộc");
      isValid = false;
    } else {
      setIdentitycardError("");
    }
    if (avatar === "") {
      setAvatarError("Ảnh đại diện là bắt buộc");
      isValid = false;
    } else {
      setAvatarError("");
    }
    if (dob === "") {
      setDobError("Ngày, tháng, năm sinh là bắt buộc");
      isValid = false;
    } else {
      setDobError("");
    }
    if (street === "") {
      setStreetError("Tên đường là bắt buộc");
      isValid = false;
    } else {
      setStreetError("");
    }
    if (commune === "") {
      setCommuneError("Tên xã, phường là bắt buộc");
      isValid = false;
    } else {
      setCommuneError("");
    }
    if (district === "") {
      setDistrictError("Tên quận, huyện là bắt buộc");
      isValid = false;
    } else {
      setDistrictError("");
    }
    if (province === "") {
      setProvinceError("Tên tỉnh là bắt buộc");
      isValid = false;
    } else {
      setProvinceError("");
    }
    // if (shipperstatus === "") {
    //   setShiperstatusError("Trạng thái nhân viên là bắt buộc");
    //   isValid = false;
    // } else {
    //   setShiperstatusError("");
    // }
    if (deliveryarea == "") {
      setDeliveryareaError("Khu vực giao hàng là bắt buộc");
      isValid = false;
    } else {
      setDeliveryareaError("");
    }

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "username":
        setUsername(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      case "fullname":
        setFullname(value);
        break;
      case "phonenumber":
        setPhonenumber(value);
        break;
      case "street":
        setStreet(value);
        break;
      case "commune":
        setCommune(value);
        break;
      case "district":
        setDistrict(value);
        break;
      case "province":
        setProvince(value);
        break;
      case "identitycard":
        setIdentitycard(value);
        break;
      case "avatar":
        setAvatar(value);
        break;
      case "dob":
        setDob(value);
        break;
      // case "shipperstatus":
      //   setShiperStatus(value);
      //   break;
      case "deliveryarea":
        setDeliveryArea(value);
        break;
      default:
        break;
    }
  };

  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("fullname", fullname);
      formData.append(
        "address",
        JSON.stringify({
          street,
          commune,
          district,
          province,
        })
      );
      formData.append("phonenumber", phonenumber);
      formData.append("identityCard", identitycard);
      formData.append("dob", dob);
      formData.append("role", "shipper");
      formData.append("status", "false");
      formData.append("deliveryarea", deliveryarea);
      formData.append("shipperstatus", "Không sẵn sàng");

      // Kiểm tra nếu avatar được gửi
      if (avatar) {
        formData.append("avatar", avatar); // Nếu avatar là File hoặc Blob
      }

      await axios.post(`${API_BASE_URL}/auth/shipper/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setToastMessage("Đăng ký thành công! Vui lòng chờ xác nhận.");
      navigate("/shipper/login");
    } catch (error) {
      console.error(error.response.data); // In ra lỗi chi tiết
      toast.error("Đăng ký thất bại, vui lòng thử lại sau!");
    } finally {
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
        <div className="flex justify-center items-center h-full w-full">
          <Loading />
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen bg-fourth">
          <div className="w-full max-w-4xl bg-white rounded-2xl px-8 py-6 shadow-lg">
            <h1 className="text-primary py-3 font-bold text-center text-3xl">
              Đăng ký Shipper
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {/* Left Column */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Tên đăng nhập:
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {usernameError && (
                  <p className="text-red-500 text-sm">{usernameError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Email:
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {emailError && (
                  <p className="text-red-500 text-sm">{emailError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fullname"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Họ và tên:
                </label>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  placeholder="Họ và tên"
                  value={fullname}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {fullnameError && (
                  <p className="text-red-500 text-sm">{fullnameError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phonenumber"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Số điện thoại:
                </label>
                <input
                  id="phonenumber"
                  name="phonenumber"
                  type="text"
                  placeholder="Số điện thoại"
                  value={phonenumber}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {phonenumberError && (
                  <p className="text-red-500 text-sm">{phonenumberError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Mật khẩu:
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2"
                    onClick={handlePasswordVisibility}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Nhập lại mật khẩu:
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {confirmPasswordError && (
                  <p className="text-red-500 text-sm">{confirmPasswordError}</p>
                )}
              </div>

              {/* Right Column */}
              <div>
                <label
                  htmlFor="identitycard"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Số chứng minh thư:
                </label>
                <input
                  id="identitycard"
                  name="identitycard"
                  type="text"
                  placeholder="Số chứng minh thư"
                  value={identitycard}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {identitycardError && (
                  <p className="text-red-500 text-sm">{identitycardError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="dob"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Ngày sinh:
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={dob}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {dobError && <p className="text-red-500 text-sm">{dobError}</p>}
              </div>

              <div>
                <label
                  htmlFor="avatar"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Ảnh đại diện:
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  onChange={(e) => setAvatar(e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {avatarError && (
                  <p className="text-red-500 text-sm">{avatarError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="street"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Địa chỉ (Đường):
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  placeholder="Địa chỉ"
                  value={street}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {streetError && (
                  <p className="text-red-500 text-sm">{streetError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="commune"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Xã/Phường:
                </label>
                <input
                  id="commune"
                  name="commune"
                  type="text"
                  placeholder="Xã/Phường"
                  value={commune}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {communeError && (
                  <p className="text-red-500 text-sm">{communeError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="district"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Quận/Huyện:
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  placeholder="Quận/Huyện"
                  value={district}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {districtError && (
                  <p className="text-red-500 text-sm">{districtError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="province"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Tỉnh/Thành phố:
                </label>
                <input
                  id="province"
                  name="province"
                  type="text"
                  placeholder="Tỉnh/Thành phố"
                  value={province}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                {provinceError && (
                  <p className="text-red-500 text-sm">{provinceError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="deliveryarea"
                  className="block text-lg text-gray-700 font-semibold mb-1"
                >
                  Khu vực giao hàng (Quận/Huyện)
                </label>
                <select
                  id="deliveryarea"
                  name="deliveryarea"
                  value={deliveryarea}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="">Chọn khu vực giao hàng</option>
                  <option value="Khu vực 1">Khu vực 1</option>
                  <option value="Khu vực 2">Khu vực 2</option>
                  <option value="Khu vực 3">Khu vực 3</option>
                </select>
                {deliveryareaError && (
                  <p className="text-red-500 text-sm">{deliveryareaError}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-primary text-white py-3 rounded-lg mt-4 hover:bg-secondary transition duration-300"
            >
              Đăng ký
            </button>

            <p className="text-center mt-4">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-primary font-semibold">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ShipperRegister;
