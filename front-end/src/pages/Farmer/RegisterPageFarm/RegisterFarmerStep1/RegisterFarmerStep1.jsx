 import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
 import { faUser, faShoppingCart,faCheckCircle  } from "@fortawesome/free-solid-svg-icons";
// import { Link } from "react-router-dom";
import HeaderFarmer from "../../../../components/HeaderFarmer/HeaderFarmer"
import '../../../../App.css'
export default function HeaderCustomer() {
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
              <input type="email" id="email" placeholder="email@gmail.com" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
            </div>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Username:</label>
              <input type="text" id="username" placeholder="Username" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Mật khẩu:</label>
              <input type="password" id="password" placeholder="Mật khẩu" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">Xác nhận mật khẩu:</label>
              <input type="password" id="confirmPassword" placeholder="Xác nhận mật khẩu" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
            </div>
            <div className="mb-4">
              <label htmlFor="fullname" className="block text-gray-700 font-bold mb-2">Họ và tên:</label>
              <input type="text" id="fullname" placeholder="Họ và tên" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
            </div>
            <div className="mb-4">
              <label htmlFor="dob" className="block text-gray-700 font-bold mb-2 w-full sm:w-auto">Ngày tháng năm sinh:</label>
              <input type="date" id="dob" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-gray-700 font-bold mb-2">Số điện thoại:</label>
              <input type="text" id="phoneNumber" placeholder="Số điện thoại" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
            </div>
            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-700 font-bold mb-2">Địa chỉ:</label>
              <input type="text" id="address" placeholder="Địa chỉ" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
            </div>
            <div className="flex justify-end w-full">
              <button className="bg-primary text-white py-2 px-4 rounded-md">Tiếp tục</button>
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
