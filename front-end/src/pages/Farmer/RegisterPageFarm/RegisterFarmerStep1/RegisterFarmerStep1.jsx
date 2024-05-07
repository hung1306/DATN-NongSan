 import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
 import { faUser, 
          faShoppingCart,
          faCheckCircle,
          faEyeSlash,
          faEye,} from "@fortawesome/free-solid-svg-icons";
// import { Link } from "react-router-dom";
import HeaderFarmer from "../../../../components/HeaderFarmer/HeaderFarmer"
import '../../../../App.css'
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";


 function RegisterFarmerStep1() {

// Khởi tạo các biến và cách nhập
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullname, setFullname] = useState("");
  const [dob, setDob] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);

// khởi tạo tb lỗi
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [fullnameError, setFullnameError] = useState("");
  const [phonenumberError, setPhonenumberError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [dobError, setDobError] = useState("");


  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    if (username === "") {
      setUsernameError("Username is required");
      isValid = false;
    } else {
      setUsernameError("");
    }
    if (email === "") {
      setEmailError("Email is required");
      isValid = false;
    } else {
      setEmailError("");
    }
    if (password === "") {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }
    if (confirmPassword === "" || confirmPassword !== password) {
      setConfirmPasswordError("Confirm password is required or does not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    if (fullname === "") {
      setFullnameError("Full name is required");
      isValid = false;
    } else {
      setFullnameError("");
    }
    if (address === ""){
      setAddressError("Address is required");
      isValid = false;
    } else {
      setAddressError("");
    }
    if (dob === "") {
      setDobError("Date of birth is required");
      isValid = false;
    } else {
      setDobError("");
    }
    if (phonenumber === "") {
      setPhonenumberError("Phone number is required");
      isValid = false;
    } else {
      setPhonenumberError("");
    }
    return isValid;
  };

  // Xử lý hiện thị password khi nhập
  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  //Xử lý bước tiếp theo
  const handleNext = async () => {
    try {
      if (!validate()) {
        return;
      }
      const userData = {
        username,
        email,
        password,
        fullname,
        dob,
        phonenumber,
        address,
        role: "farmer",
        status: true,
      };

      // Gửi yêu cầu API cho giai đoạn 1 (nhập thông tin cơ bản)
      const response = await axios.post(
        "http://localhost:3000/api/authFarmer/farmer/register/step1",
        userData
      );
      const userId = response.data.userid;
      console.log("User ID:", userId);
      // Điều hướng sang trang nhập thông tin phụ
      navigate(`/farmer/register/step2?userid=${userId}`);
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Đã có lỗi xảy ra!");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <HeaderFarmer />
      <div className=" bg-ebffeb px-10 py-3">
        <div className="bg-white flex flex-col py-2 rounded-full ">
          <p className="text-center text-lg ">ĐĂNG KÝ ĐỂ ĐƯA NÔNG SẢN CỦA BẠN ĐẾN VỚI NGƯỜI TIÊU DÙNG KHẮP NƠI TRÊN LÃNH THỔ VIỆT NAM</p>
        </div>  

        {/* Register form */}
        <div className="bg-white mt-5 flex justify-center py-10 rounded-xl">
        {/* Icon tài khoản */}
          <div className="mr-40 relative flex flex-col items-center">
            {/* Icon */}
            <FontAwesomeIcon icon={faUser} className="text-green-600 text-4xl" />
            <p className="text-center text-green-600 mt-2">Đăng ký tài khoản</p>
            {/* Đường kẻ */}
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 h-0.5 bg-gray-500 w-40  "></div>
          </div>
          
          {/* Icon giỏ hàng */}
          <div className="mr-40 relative flex flex-col items-center">
            {/* Icon */}
            <FontAwesomeIcon icon={faShoppingCart} className="text-gray-500 text-4xl" />
            <p className="text-center mt-2">Đăng ký gian hàng</p>
            {/* Đường kẻ */}
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 h-0.5 bg-gray-500 w-40"></div>
          </div>

          {/* Icon hoàn thành */}
          <div className="relative flex flex-col items-center">
            {/* Icon */}
            <FontAwesomeIcon icon={faCheckCircle} className="text-gray-500 text-4xl" />
            <p className="text-center mt-2">Hoàn thành</p>
          </div>
        </div>

        {/* Nhập thông tin */}
        <div className="flex mt-5 bg-white py-5 px-10 rounded-xl">
          <div className="w-full pr-4">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email:</label>
              <input 
                type="email"  
                id="email" 
                placeholder="email@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                {emailError && <p className="text-red-500">{emailError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Username:</label>
              <input 
                type="text" 
                id="username" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                {usernameError && <p className="text-red-500">{usernameError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Mật khẩu:</label>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="Mật khẩu" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
                onClick={handlePasswordVisibility} 
                className="absolute right-3 top-3 cursor-pointer"/>
                {passwordError && <p className="text-red-500">{passwordError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">Xác nhận mật khẩu:</label>
              <input 
                type={showPassword ? "text" : "password"}
                id="confirmPassword" 
                placeholder="Xác nhận mật khẩu" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
                onClick={handlePasswordVisibility} 
                className="absolute right-3 top-3 cursor-pointer"/>
                {confirmPasswordError && <p className="text-red-500">{confirmPasswordError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="fullname" className="block text-gray-700 font-bold mb-2">Họ và tên:</label>
              <input 
                type="text" 
                id="fullname" 
                placeholder="Họ và tên" 
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                {fullnameError && <p className="text-red-500">{fullnameError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="dob" className="block text-gray-700 font-bold mb-2 w-full sm:w-auto">Ngày tháng năm sinh:</label>
              <input 
                type="date" 
                id="dob" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                {dobError && <p className="text-red-500">{dobError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-gray-700 font-bold mb-2">Số điện thoại:</label>
              <input 
                type="text" 
                id="phoneNumber" 
                placeholder="Số điện thoại" 
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                {phonenumberError && <p className="text-red-500">{phonenumberError}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-700 font-bold mb-2">Địa chỉ:</label>
              <input 
                type="text" 
                id="address" 
                placeholder="Địa chỉ" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                {addressError && <p className="text-red-500">{addressError}</p>}
            </div>
            <div className="flex justify-end w-full">
              <button 
                onClick={handleNext}
                className="bg-primary text-white py-2 px-4 rounded-md">Tiếp tục</button>
            </div>
          </div>
          
          {/* <div className="w-full pl-4">
            <div className="mb-4">
              <label htmlFor="fullname" className="block text-gray-700 font-bold mb-2">Họ và tên:</label>
              <input type="text" id="fullname" className="border rounded-md py-2 px-3 w-full" />
            </div>
            <div className="mb-4">
              <label htmlFor="dob" className="block text-gray-700 font-bold mb-2 w-full sm:w-auto">Ngày tháng năm sinh:</label>
              <input type="date" id="dob" className="border rounded-md py-2 px-3 w-full" />
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-gray-700 font-bold mb-2">Số điện thoại:</label>
              <input type="text" id="phoneNumber" className="border rounded-md py-2 px-3 w-full" />
            </div>
            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-700 font-bold mb-2">Địa chỉ:</label>
              <input type="text" id="address" className="border rounded-md py-2 px-3 w-full" />
            </div>
          </div> */}
        </div>

        {/* Kết thúc nhập thông tin */}
      </div>
    </div>
  );
}


export default RegisterFarmerStep1;