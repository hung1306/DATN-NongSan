import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faShoppingCart,faCheckCircle  } from "@fortawesome/free-solid-svg-icons";
// import { Link } from "react-router-dom";
import HeaderFarmer from "../../../../components/HeaderFarmer/HeaderFarmer"
import '../../../../App.css'
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useLocation } from "react-router-dom";

// import Map from './components/Map'
// const key = 'yourKey'
export default function RegisterFarmerStep2() {

    const [farmName, setFarmName] = useState("");
    const [farmType, setFarmType] = useState("");
    const [contactName, setContactName] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [farmScale, setFarmScale] = useState("");
    const [farmDescription, setFarmDescription] = useState("");


    const [farmNameError, setFarmNameError] = useState("");
    const [farmTypeError, setFarmTypeError] = useState("");
    const [contactNameError, setContactNameError] = useState("");
    const [idNumberError, setIdNumberError] = useState("");
    const [farmScaleError, setFarmScaleError] = useState("");
    const [farmDescriptionError, setFarmDescriptionError] = useState("");

    const location = useLocation();
    const userId = new URLSearchParams(location.search).get('userid');

    const navigate = useNavigate();

    const validate = () => {
        let isValid = true;

        // Reset errors
        setFarmNameError("");
        setFarmTypeError("");
        setContactNameError("");
        setIdNumberError("");
        setFarmScaleError("");
        setFarmDescriptionError("");

        if (farmName.trim() === "") {
            setFarmNameError("Vui lòng nhập tên trang trại");
            isValid = false;
        }

        // Validate farm type
        if (farmType.trim() === "") {
            setFarmTypeError("Vui lòng nhập loại trang trại");
            isValid = false;
        }

        // Validate contact name
        if (contactName.trim() === "") {
            setContactNameError("Vui lòng nhập tên người liên hệ");
            isValid = false;
        }

        // Validate ID number
        if (idNumber.trim() === "") {
            setIdNumberError("Vui lòng nhập số CMND/CCCD");
            isValid = false;
        }

        // Validate farm scale
        if (farmScale.trim() === "") {
            setFarmScaleError("Vui lòng nhập quy mô trang trại");
            isValid = false;
        }

        // Validate farm description
        if (farmDescription.trim() === "") {
            setFarmDescriptionError("Vui lòng nhập mô tả trang trại");
            isValid = false;
        }
        return isValid;
    };

    const handleNext = async () => {
        // Validate input fields here
        try {
            if (!validate()) {
              return;
            }
            const farmData = {
                farmName,
                farmType,
                contactName,
                idNumber,
                farmScale,
                farmDescription,
            };
      
            // Gửi yêu cầu API cho giai đoạn 1 (nhập thông tin cơ bản)
            const response = await axios.post(
              `http://localhost:3000/api/authFarmer/farmer/register/step2/${userId}`,
              farmData
            );
            const farmId = response.data.farmid;
            console.log("Farm ID:", farmId);
            // Điều hướng sang trang nhập thông tin phụ
            navigate(`/farmer/register/step3?farmId=${farmId}`);
          } catch (error) {
            console.error("Error during registration:", error);
            alert("Đã có lỗi xảy ra!");
          }
    };

    const handlePrevious = async() => {
        const confirmed = window.confirm("Bạn có chắc chắn muốn quay lại bước trước đó không?");
        if (confirmed) {
            // Nếu người dùng xác nhận, điều hướng đến bước trước đó
            navigate('/farmer/register/step1');
        }
    }
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
            <FontAwesomeIcon icon={faUser} className="text-gray-500 text-4xl" />
            <p className="text-center mt-2">Đăng ký tài khoản</p>
            {/* Đường kẻ */}
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 h-0.5 bg-gray-500 w-40  "></div>
            </div>
            
            {/* Icon giỏ hàng */}
            <div className="mr-40 relative flex flex-col items-center">
            {/* Icon */}
            <FontAwesomeIcon icon={faShoppingCart} className=" text-green-600 text-4xl" />
            <p className="text-center text-green-600 mt-2">Đăng ký gian hàng</p>
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
                            <label htmlFor="farmName" className="block text-gray-700 font-bold mb-2">Tên trang trại:</label>
                            <input 
                                type="text" 
                                id="farmName" 
                                placeholder="Tên trang trại" 
                                value={farmName} 
                                onChange={(e) => setFarmName(e.target.value)} 
                                className="border rounded-md py-2 px-3 w-full bg-ebffeb" 
                            />
                            {farmNameError && <p className="text-red-500">{farmNameError}</p>}
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="farmType" className="block text-gray-700 font-bold mb-2">Loại trang trại:</label>
                            <input 
                                type="text" 
                                id="farmType" 
                                placeholder="Loại trang trại" 
                                value={farmType} 
                                onChange={(e) => setFarmType(e.target.value)} 
                                className="border rounded-md py-2 px-3 w-full bg-ebffeb" 
                            />
                            {farmTypeError && <p className="text-red-500">{farmTypeError}</p>}
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="contactName" className="block text-gray-700 font-bold mb-2">Tên người liên hệ:</label>
                            <input 
                                type="text" 
                                id="contactName" 
                                placeholder="Tên người liên hệ" 
                                value={contactName} 
                                onChange={(e) => setContactName(e.target.value)} 
                                className="border rounded-md py-2 px-3 w-full bg-ebffeb" 
                            />
                            {contactNameError && <p className="text-red-500">{contactNameError}</p>}
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="idNumber" className="block text-gray-700 font-bold mb-2">Số CMND/CCCD:</label>
                            <input 
                                type="text" 
                                id="idNumber" 
                                placeholder="Số CMND/CCCD" 
                                value={idNumber} 
                                onChange={(e) => setIdNumber(e.target.value)} 
                                className="border rounded-md py-2 px-3 w-full bg-ebffeb" 
                            />
                            {idNumberError && <p className="text-red-500">{idNumberError}</p>}
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="farmScale" className="block text-gray-700 font-bold mb-2">Quy mô trang trại:</label>
                            <input 
                                type="text" 
                                id="farmScale" 
                                placeholder="Quy mô trang trại" 
                                value={farmScale} 
                                onChange={(e) => setFarmScale(e.target.value)} 
                                className="border rounded-md py-2 px-3 w-full bg-ebffeb" 
                            />
                            {farmScaleError && <p className="text-red-500">{farmScaleError}</p>}
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="farmDescription" className="block text-gray-700 font-bold mb-2">Mô tả trang trại:</label>
                            <textarea 
                                id="farmDescription" 
                                placeholder="Mô tả trang trại" 
                                value={farmDescription} 
                                onChange={(e) => setFarmDescription(e.target.value)} 
                                className="border rounded-md py-2 px-3 w-full h-40 bg-ebffeb resize-none"
                            ></textarea>
                            {farmDescriptionError && <p className="text-red-500">{farmDescriptionError}</p>}
                        </div>
                        
                        <div className="flex justify-between mt-4">
                            <button onClick={handlePrevious} className="bg-primary text-white py-2 px-4 rounded-md">Quay lại</button>
                            <button onClick={handleNext} className="bg-primary text-white py-2 px-4 rounded-md">Tiếp tục</button>
                        </div>
                    </div>
                </div>


        {/* Kết thúc nhập thông tin */}
        </div>
    </div>
 );
}
