import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faShoppingCart,faCheckCircle  } from "@fortawesome/free-solid-svg-icons";
// import { Link } from "react-router-dom";
import HeaderFarmer from "../../../../components/HeaderFarmer/HeaderFarmer"
import '../../../../App.css'
// import Map from './components/Map'
// const key = 'yourKey'
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
                {/* Tên trang trại */}
                <div className="mb-4">
                    <label htmlFor="farmName" className="block text-gray-700 font-bold mb-2">Tên trang trại:</label>
                    <input type="text" id="farmName" placeholder="Tên trang trại" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                </div>
                
                {/* Loại trang trại */}
                <div className="mb-4">
                    <label htmlFor="farmType" className="block text-gray-700 font-bold mb-2">Loại trang trại:</label>
                    <input type="text" id="farmType" placeholder="Loại trang trại" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                </div>
                
                {/* Tên người liên hệ */}
                <div className="mb-4">
                    <label htmlFor="contactName" className="block text-gray-700 font-bold mb-2">Tên người liên hệ:</label>
                    <input type="text" id="contactName" placeholder="Tên người liên hệ" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                </div>
                
                {/* Số CMND/CCCD */}
                <div className="mb-4">
                    <label htmlFor="idNumber" className="block text-gray-700 font-bold mb-2">Số CMND/CCCD:</label>
                    <input type="text" id="idNumber" placeholder="Số CMND/CCCD" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                </div>
                
                {/* Quy mô trang trại */}
                <div className="mb-4">
                    <label htmlFor="farmScale" className="block text-gray-700 font-bold mb-2">Quy mô trang trại:</label>
                    <input type="text" id="farmScale" placeholder="Quy mô trang trại" className="border rounded-md py-2 px-3 w-full bg-ebffeb" />
                </div>
                
                {/* Mô tả trang trại */}
                <div className="mb-4">
                    <label htmlFor="farmDescription" className="block text-gray-700 font-bold mb-2">Mô tả trang trại:</label>
                    <textarea id="farmDescription" placeholder="Mô tả trang trại" className="border rounded-md py-2 px-3 w-full h-40 bg-ebffeb resize-none"></textarea>
                </div>
                {/* gg Map */}
                {/* <div>
                    <Map 
                        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap`}
                        loadingElement={<div style={{ height: `100%` }} />}
                        containerElement={<div style={{ height: `90vh`, margin: `auto`, border: '2px solid black' }} />}
                        mapElement={<div style={{ height: `100%` }} />}
                    />
                </div> */}
                    <div className="flex justify-between mt-4">
                        <button className="bg-primary text-white py-2 px-4 rounded-md">Quay lại</button>
                        <button className="bg-primary text-white py-2 px-4 rounded-md">Tiếp tục</button>
                    </div>
            </div>
        </div>


        {/* Kết thúc nhập thông tin */}
        </div>
    </div>
 );
}
