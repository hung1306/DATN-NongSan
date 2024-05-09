// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faUser, faShoppingCart,faCheckCircle  } from "@fortawesome/free-solid-svg-icons";
// import { Link } from "react-router-dom";
import HeaderFarmer from "../../../components/HeaderFarmer/HeaderFarmer";
import "../../../App.css";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {useLocation} from "react-router-dom";
// import { faBell } from "@fortawesome/free-solid-svg-icons";
// import { Link } from "react-router-dom";

export default function StatisticPage() {
  const [showNav, setShowNav] = useState(false);
  const [numberOfTrees, setNumberOfTrees] = useState(0);
  const [numberOfProducts, setNumberOfProducts] = useState(0);
  const [numberOfOrders, setNumberOfOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);

  const location = useLocation();
  console.log(location);
  const farmId = new URLSearchParams(location.search).get("farmid");
  console.log(farmId);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`/farmer/statistic/?farmId=${farmId}`); // Replace with your API endpoint
        setNumberOfTrees(response.data.numberOfTrees);
        setNumberOfProducts(response.data.numberOfProducts);
        setNumberOfOrders(response.data.numberOfOrders);
        setRevenue(response.data.revenue);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    }
    fetchData();
  }, []);

  // Hiện thị thanh nav-icon
  const navRef = useRef();

  const toggleNav = () => {
    setShowNav(!showNav);
  };

  const closeNav = () => {
    setShowNav(false);
  };

  const dataRevenue = [
    { month: "Jan", revenue: 1000 },
    { month: "Feb", revenue: 2000 },
    { month: "Mar", revenue: 1500 },
    { month: "Mar", revenue: 1500 },
    { month: "Mar", revenue: 1500 },
    { month: "Mar", revenue: 1500 },
    { month: "Mar", revenue: 1500 },
    // Add more data as needed
  ];

  const dataOrders = [
    { month: "Jan", orders: 20 },
    { month: "Feb", orders: 30 },
    { month: "Mar", orders: 25 },
    { month: "Mar", orders: 25 },
    { month: "Mar", orders: 25 },
    { month: "Mar", orders: 25 },
    // Add more data as needed
  ];

  const [chartWidth, setChartWidth] = useState(400);
  const [chartHeight, setChartHeight] = useState(500);

  useEffect(() => {
    const handleResize = () => {
      setChartWidth(window.innerWidth < 1100 ? 250 : 400);
      setChartHeight(window.innerWidth < 768 ? 150 : 500);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col placeholder-color">
      <HeaderFarmer />
      <div className=" relative">
        <div ref={navRef}>
          {/* Icon */}
          <div
            className="cursor-pointer px-3 py-2 text-2xl"
            onClick={toggleNav}
          >
            {showNav ? null : (
              <FontAwesomeIcon icon={faBars} onClick={closeNav} />
            )}
          </div>
          {showNav && (
            <div className="bg-gray-200 h-screen w-64 absolute left-0 top-0   border border-gray-300">
              <div className="flex items-center px-5 py-3 text-2xl">
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  onClick={closeNav}
                  className="mr-2 cursor-pointer"
                />
                {/* <span className="text-lg">Back</span> */}
              </div>
              <ul className="py-4">
                <li className="px-4 py-2 cursor-pointer click:bg-gray-300 bg-primary text-white ">
                  Thống kê
                </li>
                <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">
                  Quản lý vườn
                </li>
                <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">
                  Quản lý danh mục
                </li>
                <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">
                  Quản lý sản phẩm
                </li>
                <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">
                  Quản lý đơn hàng
                </li>
                <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">
                  Quản lý thanh toán
                </li>
                <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">
                  Thông tin cá nhân
                </li>
              </ul>
            </div>
          )}
        </div>

        <div
          className={`flex-grow flex flex-col justify-center items-center ${
            showNav ? "ml-64" : ""
          }`}
        >
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-200 p-4 rounded-md shadow-lg">
              <p>Số loại cây đang trồng:</p>
              <p>{numberOfTrees}</p>
            </div>
            <div className="bg-gray-200 p-4 rounded-md shadow-lg">
              <p>Số sản phẩm:</p>
              <p>{numberOfProducts}</p>
            </div>
            <div className="bg-gray-200 p-4 rounded-md shadow-lg">
              <p>Số đơn hàng:</p>
              <p>{numberOfOrders}</p>
            </div>
            <div className="bg-gray-200 p-4 rounded-md shadow-lg">
              <p>Doanh thu:</p>
              <p>{revenue}</p>
            </div>
          </div>
          <div className="flex flex-row mt-10">
            <div className={showNav ? "mr-10 shadow-lg" : " mr-10 shadow-lg"}>
              <BarChart
                width={chartWidth}
                height={chartHeight}
                data={dataRevenue}
              >
                <CartesianGrid strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </div>
            <div className={showNav ? "ml-10 mr-5 shadow-lg" : " shadow-lg"}>
              <BarChart
                width={chartWidth}
                height={chartHeight}
                data={dataOrders}
              >
                <CartesianGrid strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#82ca9d" />
              </BarChart>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
