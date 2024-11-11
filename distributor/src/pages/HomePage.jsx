import { useEffect, useState } from "react";
import HeaderDistributor from "../components/HeaderDistributor";
import { useToast } from "../context/ToastContext";
import { toast, ToastContainer } from "react-toastify";
import axios from 'axios';
import { API_BASE_URL } from "../config/config";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function HomePage() {
  const { toastMessage } = useToast();

  useEffect(() => {
    if (toastMessage) {
      toast.success(toastMessage);
    }
  }, [toastMessage]);

  const [info, setInfo] = useState();

  // Dữ liệu giả định cho biểu đồ nếu chưa có API
  const salesData = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Apr", sales: 7000 },
    { month: "May", sales: 2000 },
    { month: "Jun", sales: 6000 },
  ];

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/distributor-home`);
        setInfo(response.data);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchInfo();
  }, []);

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/category/count-categories`);
        const categoriesData = response.data.map(category => ({
          ...category,
          quantity: Number(category.quantity)
        }));
        setCategories(categoriesData);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <HeaderDistributor />
      <ToastContainer />
      <div className="w-10/12 m-auto flex justify-center mt-32">
        <div className="bg-primary text-center p-5 rounded-xl w-56 h-56 flex flex-col justify-center items-center transform transition-all duration-500 hover:bg-fourth hover:text-black shadow-lg hover:shadow-2xl m-10 text-white cursor-pointer">
          <p className="font-bold text-2xl">Số sản phẩm</p>
          <p className="font-extrabold italic text-7xl animate-bounce mt-6">
            {info?.productCount}
          </p>
        </div>
        <div className="bg-red-700 text-center p-5 rounded-xl w-56 h-56 flex flex-col justify-center items-center transform transition-all duration-500 hover:bg-fourth hover:text-black shadow-lg hover:shadow-2xl m-10 text-white cursor-pointer ">
          <p className="font-bold text-2xl">Số nông trại</p>
          <p className="font-extrabold italic text-7xl animate-bounce mt-6">
            10
          </p>
        </div>
        <div className="bg-blue-600 text-center p-5 rounded-xl w-56 h-56 flex flex-col justify-center items-center transform transition-all duration-500 hover:bg-fourth hover:text-black shadow-lg hover:shadow-2xl m-10 text-white cursor-pointer ">
          <p className="font-bold text-2xl">Số khách hàng</p>
          <p className="font-extrabold italic text-7xl animate-bounce mt-6">
            {info?.customerCount}
          </p>
        </div>
        <div className="bg-fuchsia-800 text-center p-5 rounded-xl w-56 h-56 flex flex-col justify-center items-center transform transition-all duration-500 hover:bg-fourth hover:text-black shadow-lg hover:shadow-2xl m-10 text-white cursor-pointer ">
          <p className="font-bold text-2xl">Số đơn hàng</p>
          <p className="font-extrabold italic text-7xl animate-bounce mt-6">
            {info?.orderCount}
          </p>
        </div>
      </div>

      <div className="w-10/12 flex justify-center m-auto">
        {/* Biểu đồ số sản phẩm theo danh mục */}
        <div className="w-6/12 bg-white h-96 m-7 rounded-lg shadow-lg p-5">
          <h2 className="text-center text-primary font-bold text-2xl mb-4">Số Sản Phẩm Theo Danh Mục</h2>
          <BarChart width={700} height={320} data={categories} >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoryname" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#339900" className="mt-5" />
          </BarChart>
        </div>

        {/* Biểu đồ doanh số bán hàng */}
        <div className="w-6/12 bg-white h-96 m-7 rounded-lg shadow-lg p-5">
          <h2 className="text-center font-bold text-xl mb-4">Doanh Số Bán Hàng</h2>
          <BarChart width={400} height={300} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}