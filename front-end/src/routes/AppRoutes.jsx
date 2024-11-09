// AppRoutes.js
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute/PrivateRoute"; // Import PrivateRoute
import CartPage from "../pages/Customer/CartPage/CartPage";
import CategoryPage from "../pages/Customer/CategoryPage/CategoryPage";
import CheckoutPage from "../pages/Customer/CheckoutPage/CheckoutPage";
import FarmInfoPage from "../pages/Customer/FarmInfoPage/FarmInfoPage";
import HomePage from "../pages/Customer/HomePage/HomePage";
import LoginCustomer from "../pages/Customer/LoginPage/LoginCustomer";
import ProductDetailShow from "../pages/Customer/ProductDetail/ProductDetailShow";
import RegisterCustomerStep1 from "../pages/Customer/RegisterPage/RegisterCustomerStep1/RegisterCustomerStep1";
import RegisterCustomerStep2 from "../pages/Customer/RegisterPage/RegisterCustomerStep2/RegisterCustomerStep2";
import SearchPage from "../pages/Customer/SearchPage/SearchPage";
import FarmProductPage from "../pages/Customer/FarmProductPage/FarmProductPage";
import FarmSeasonPage from "../pages/Customer/FarmSeasonPage/FarmSeasonPage";
import NotFound from "../pages/NotFound/NotFound";
import PurchasesHistory from "../pages/Customer/PurchasesHistory/PurchasesHistory";
import AboutAgriPage from "../pages/Customer/AboutAgriPage/AboutAgriPage";
import FarmerDashboard from "../pages/Farmer/FarmerDashboard/FarmerDashboard";
import FarmerLogin from "../pages/Farmer/FarmerLogin/FarmerLogin";
import FarmerRegisterStep1 from "../pages/Farmer/FarmerRegister/FarmerRegisterStep1/FarmerRegisterStep1";
import FarmerRegisterStep2 from "../pages/Farmer/FarmerRegister/FarmerRegisterStep2/FarmerRegisterStep2";
import FarmerRegisterStep3 from "../pages/Farmer/FarmerRegister/FarmerRegisterStep3/FarmerRegisterStep3";
import FarmerShowProducts from "../pages/Farmer/FarmerProduct/FarmerShowProducts";
import FarmerCrop from "../pages/Farmer/FarmerCrop/FarmerCrop";
import FarmerShowOrders from "../pages/Farmer/FarmerOrder/FarmerShowOrders";
import FarmerDetailInfo from "../pages/Farmer/FarmerInfo/FarmerDetailInfo";
import DetailInfoPage from "../pages/Customer/DetailInfoPage/DetailInfoPage";
import FarmerProfile from "../pages/Farmer/FarmerProfile/FarmerProfile";
import { ToastProvider } from "../context/ToastContext";
import { LoadingProvider } from "../context/LoadingContext";
import PaymentSuccessPage from "../pages/Customer/PaymentSuccessPage/PaymentSuccessPage";
import SearchByImage from "../pages/Customer/SearchByImage/SearchByImage";
import ShipperRegister from "../pages/Shipper/ShipperResgister/ShipperRegister";
import ShipperLogin from "../pages/Shipper/ShipperLogin/ShipperLogin";
import ShipperPage from "../pages/Shipper/ShipperPage/ShipperPage";
import ShipperProfile from "../pages/Shipper/ShipperProfile/ShipperProfile";
import FarmerPrivateRoute from "./PrivateRoute/FarmerPrivateRoute";
import ShipperPrivateRoute from "./PrivateRoute/ShipperPrivateRoute";

export default function AppRoutes() {
  return (
    <ToastProvider>
      <LoadingProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Các route công khai cho customer */}
            <Route path="/register/step1" element={<RegisterCustomerStep1 />} />
            <Route path="/register/step2" element={<RegisterCustomerStep2 />} />
            <Route path="/login" element={<LoginCustomer />} />
            <Route path="/product/:id" element={<ProductDetailShow />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/about-agri" element={<AboutAgriPage />} />
            <Route path="/farm/info/:id" element={<FarmInfoPage />} />
            <Route path="/search-image" element={<SearchByImage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Các route cần bảo vệ cho customer */}
            <Route
              path="/cart"
              element={<PrivateRoute element={<CartPage />} />}
            />
            <Route
              path="/checkout"
              element={<PrivateRoute element={<CheckoutPage />} />}
            />
            <Route
              path="/purchase-history"
              element={<PrivateRoute element={<PurchasesHistory />} />}
            />
            <Route
              path="/detail-info"
              element={<PrivateRoute element={<DetailInfoPage />} />}
            />
            <Route
              path="/payment-success"
              element={<PrivateRoute element={<PaymentSuccessPage />} />}
            />
            <Route
              path="/farm/productdetail/:id"
              element={<PrivateRoute element={<FarmProductPage />} />}
            />
            <Route
              path="/farm/season/:id"
              element={<PrivateRoute element={<FarmSeasonPage />} />}
            />

            {/* Các route công khai cho farmer */}
            <Route path="/farmer/login" element={<FarmerLogin />} />
            <Route
              path="/farmer/register/step1"
              element={<FarmerRegisterStep1 />}
            />
            <Route
              path="/farmer/register/step2"
              element={<FarmerRegisterStep2 />}
            />
            <Route
              path="/farmer/register/step3"
              element={<FarmerRegisterStep3 />}
            />

            {/* Các route cần bảo vệ cho farmer */}
            <Route
              path="/farmer"
              element={<FarmerPrivateRoute element={<FarmerDashboard />} />}
            />
            <Route
              path="/farmer/products"
              element={<FarmerPrivateRoute element={<FarmerShowProducts />} />}
            />
            <Route
              path="/farmer/farms/crop"
              element={<FarmerPrivateRoute element={<FarmerCrop />} />}
            />
            <Route
              path="/farmer/farm/info"
              element={<FarmerPrivateRoute element={<FarmerProfile />} />}
            />
            <Route
              path="/farmer/orders"
              element={<FarmerPrivateRoute element={<FarmerShowOrders />} />}
            />
            <Route
              path="/farmer/profile"
              element={<FarmerPrivateRoute element={<FarmerDetailInfo />} />}
            />

            {/* Các route công khai và cần bảo vệ cho shipper */}
            <Route path="/shipper/register" element={<ShipperRegister />} />
            <Route path="/shipper/login" element={<ShipperLogin />} />
            <Route
              path="/shipper"
              element={<ShipperPrivateRoute element={<ShipperPage />} />}
            />
            <Route
              path="/shipper/profile"
              element={<ShipperPrivateRoute element={<ShipperProfile />} />}
            />

            {/* Route mặc định cho trang không tồn tại */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </LoadingProvider>
    </ToastProvider>
  );
}
