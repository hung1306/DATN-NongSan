import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ProductPage from "../pages/Product/ProductPage";
import CategoryPage from "../pages/Category/CategoryPage";
import OrderPage from "../pages/Order/OrderPage";
import LoginPage from "../pages/LoginPage";
import { ToastProvider } from "../context/ToastContext";
import FarmerPage from "../pages/Farmer/FarmerPage";
import { LoadingProvider } from "../context/LoadingContext";
import NotificatonPage from "../pages/Notification/NotificatonPage";
import ShipperManagePage from "../pages/Shipper/ShipperManagePage";

export default function AppRoutes() {
  return (
    <ToastProvider>
      <LoadingProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/farmer" element={<FarmerPage />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/notification" element={<NotificatonPage />} />
            <Route path="/shipper" element={<ShipperManagePage />} />
            <Route path="*" element={<div>404</div>} />
          </Routes>
        </Router>
      </LoadingProvider>
    </ToastProvider>
  );
}
