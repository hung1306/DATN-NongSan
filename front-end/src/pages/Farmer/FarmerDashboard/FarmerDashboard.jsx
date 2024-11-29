import { toast } from "react-toastify";
import FarmerNavBar from "../../../components/FarmerComponent/FarmerNavBar/FarmerNavBar";
import HeaderFarmer from "../../../components/FarmerComponent/HeaderFarmer/HeaderFarmer";
import { useEffect, useState } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config";
import { jwtDecode } from "jwt-decode";
import Slider from "react-slick/lib/slider";

export default function FarmerDashboard() {
  const { toastMessage, setToastMessage } = useToast();
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;
  const [farmInfo, setFarmInfo] = useState(null);
  const [farmImages, setFarmImages] = useState([]);
  useEffect(() => {
    const fetchFarm = async () => {
      const response = await axios.get(`${API_BASE_URL}/farm/user/${userId}`);
      setFarmInfo(response.data);
    };
    fetchFarm();
  }, [userId]);

  useEffect(() => {
    setFarmImages([
      farmInfo?.farmimage,
      farmInfo?.farmimage1,
      farmInfo?.farmimage2,
      farmInfo?.farmimage3,
    ]);
  }, [farmInfo]);

  const [categoryCount, setCategoryCount] = useState([]);
  useEffect(() => {
    const fetchCategoryCount = async () => {
      const response = await axios.get(
        `${API_BASE_URL}/farmer/categories/count/${userId}`
      );
      setCategoryCount(response.data);
    };
    fetchCategoryCount();
  }, [userId]);

  useEffect(() => {
    if (toastMessage) {
      toast.success(toastMessage);
      setToastMessage(null);
    }
  }, [toastMessage, setToastMessage]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    <div>
      <HeaderFarmer />
      <div className="flex mt-20">
        <FarmerNavBar />
        <div className="bg-fourth w-5/6 h-screen fixed right-0 top-0 mt-20">
          <div className="flex justify-center mt-5">
            <div className="bg-white shadow-2xl rounded p-10 mb-4 m-3 w-10/12">
              <h2 className="text-2xl m-2 font-bold text-primary">
                Tổng quan trang trại
              </h2>
              <div className="flex mt-5 px-5">
                <div className="text-primary font-bold w-9/12">
                  <p className="text-xl m-2">
                    {" "}
                    Tên trang trại:{" "}
                    <span className="font-semibold text-third ml-3">
                      {farmInfo?.farmname}
                    </span>
                  </p>
                  <p className="text-xl m-2">
                    {" "}
                    Diện tích:{" "}
                    <span className="font-semibold text-third ml-3">
                      {farmInfo?.farmarea} ha
                    </span>
                  </p>
                  <p className="text-xl m-2">
                    {" "}
                    Địa chỉ:{" "}
                    <span className="font-semibold text-third ml-3">
                      {farmInfo?.farmstreet} , {farmInfo?.farmcommune},{" "}
                      {farmInfo?.farmdistrict}, {farmInfo?.farmprovince}
                    </span>
                  </p>
                  <p className="text-xl m-2">
                    {" "}
                    Số điện thoại:{" "}
                    <span className="font-semibold text-third ml-3">
                      {farmInfo?.farmphone}
                    </span>
                  </p>
                  <p className="text-xl m-2">
                    {" "}
                    Tổng số sản phẩm đang cung cấp:{" "}
                    <span className="font-semibold text-third ml-3">
                      {farmInfo?.productstotal}
                    </span>
                  </p>
                </div>
                <div className="w-3/12">
                  <img
                    src={farmInfo?.farmlogo}
                    alt="farm"
                    className="rounded-full w-40 h-40 object-cover mx-auto mt-4 shadow-lg hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-white shadow-2xl rounded p-2 mb-4 w-5/12 m-3">
              <h2 className="text-2xl m-2 font-bold text-primary">
                Một số hình ảnh trang trại
              </h2>
              <div className="w-11/12 m-auto mt-5 px-5 pb-5">
                <Slider {...settings}>
                  {farmImages.map((image, index) =>
                    image ? (
                      <div key={index}>
                        <img
                          src={image}
                          alt={`farm image ${index}`}
                          className="w-full h-64 object-cover rounded-md mt-2"
                        />
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="w-full h-full object-cover rounded bg-gray-200"
                      >
                        <div
                          key={index}
                          className="w-full h-full object-cover rounded bg-gray-200 flex items-center justify-center"
                        >
                          <img
                            alt="Placeholder"
                            className="w-full h-full object-cover rounded"
                          />
                          <p className="absolute text-white bg-black bg-opacity-50 p-2 rounded">
                            Image not available
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </Slider>
              </div>
            </div>

            {/* Biểu đồ thống kê theo danh mục */}
            <div className="bg-white shadow-2xl rounded p-2 mb-4 w-5/12 m-3">
              <h2 className="text-2xl m-2 font-bold text-primary">
                Các sản phẩm của trang trại phân bố theo danh mục
              </h2>
              <div className="w-11/12 m-auto mt-5 px-5 pb-5">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryCount}>
                    <CartesianGrid stroke="#CDE6CD" />
                    <XAxis dataKey="categoryname" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#209E1E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
