import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import '../../../../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
function RegisterCustomerStep1() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (phonenumber === "") {
      setPhonenumberError("Phone number is required");
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
      const userData = {
        username,
        email,
        password,
        fullname,
        phonenumber,
        role: "customer",
        status: true,
      };

      // Gửi yêu cầu API cho giai đoạn 1 (nhập thông tin cơ bản)
      const response = await axios.post(
        "http://localhost:3000/api/auth/register/step1",
        userData
      );
      const userId = response.data.userid;
      console.log("User ID:", userId);
      // Điều hướng sang trang nhập thông tin phụ
      navigate(`/register/step2?userid=${userId}`);
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Đã có lỗi xảy ra!");
    }
  };
  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="backgroundImg">
      <div className="w-1/3 m-auto bg-fourth rounded-2xl">
      <h1 className="text-primary py-3 font-bold text-center text-40">Đăng ký</h1>
      <div className="flex justify-center px-5 my-3">
        <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
          <label htmlFor="username" className="block text-xl text-primary font-bold mb-2">Username:</label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
          />
          {usernameError && <p className="text-red-500">{usernameError}</p>}
        </div>
        
        <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
          <label htmlFor="email" className="block text-xl text-primary font-bold mb-2">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
          />
          {emailError && <p className="text-red-500">{emailError}</p>}
        </div>
      </div>
      
      <div className="flex justify-center px-5 my-3">
        <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
          <label htmlFor="password" className="block text-xl text-primary font-bold mb-2">Mật khẩu:</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
            />
            <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
                onClick={handlePasswordVisibility} 
                className="absolute right-3 top-3 cursor-pointer"
              />
          </div>
          {passwordError && <p className="text-red-500">{passwordError}</p>}
        </div>
        <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
          <label htmlFor="confirmPassword" className="block text-xl text-primary font-bold mb-2">Xác nhận mật khẩu:</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
            />
            <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
                onClick={handlePasswordVisibility} 
                className="absolute right-3 top-3 cursor-pointer"
              />
          </div>
          {confirmPasswordError && <p className="text-red-500">{confirmPasswordError}</p>}
        </div>
      </div>  


      <div className="flex justify-center px-5 my-3">
        <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
          <label htmlFor="phonenumber" className="block text-xl text-primary font-bold mb-2">Số điện thoại:</label>
          <input
            id="phonenumber"
            type="text"
            placeholder="Số điện thoại"
            value={phonenumber}
            onChange={(e) => setPhonenumber(e.target.value)}
            className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
          />
          {phonenumberError && <p className="text-red-500">{phonenumberError}</p>}
        </div>
        <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
          <label htmlFor="fullname" className="block text-xl text-primary font-bold mb-2">Họ và tên:</label>
          <input
            id="fullname"
            type="text"
            placeholder="Họ và tên"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
          />
          {fullnameError && <p className="text-red-500">{fullnameError}</p>}
        </div>
      </div>  
      <div className="flex items-center flex-col m-5">
        <button 
          onClick={handleNext}
          className="bg-primary hover:opacity-90 text-white font-bold py-2 px-4 m-3 rounded-xl w-2/3"
        >Tiếp theo</button>
        <p className="text-primary text-xl m-2">Hoặc</p>
        <button 
          onClick={handleNext}
          className="bg-third hover:opacity-90 text-white font-bold py-2 px-4 m-3 rounded-xl w-2/3"
        >Đăng ký với google</button>
        <p className="text-primary">Bạn đã có tài khoản? <Link className="text-third" to="/login">Đăng nhập</Link></p>
      </div>
      </div>
      
    </div>
  );
}

export default RegisterCustomerStep1;
