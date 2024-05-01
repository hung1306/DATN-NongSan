import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterCustomerStep1 from "../pages/Customer/RegisterPage/RegisterCustomerStep1/RegisterCustomerStep1";
import RegisterCustomerStep2 from "../pages/Customer/RegisterPage/RegisterCustomerStep2/RegisterCustomerStep2";
import HomePage from "../pages/Customer/HomePage/HomePage";
import LoginCustomer from "../pages/Customer/LoginPage/LoginCustomer";
import RegisterFarmerStep1 from "../pages/Farmer/RegisterPageFarm/RegisterFarmerStep1/RegisterFarmerStep1";
import RegisterFarmerStep2 from "../pages/Farmer/RegisterPageFarm/RegisterFarmerStep2/RegisterFarmerStep2";
import RegisterFarmerStep3 from "../pages/Farmer/RegisterPageFarm/RegisterFarmerStep3/RegisterFarmerStep3";
import HomePageFarm from "../pages/Farmer/HomePageFarm/InfoPageFarm/InfoFarmer";

import NotFound from "../pages/NotFound/NotFound";
export default function AppRoutes() {
    return (
        <div>
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register/step1" element={<RegisterCustomerStep1 />} />
                <Route path="/register/step2" element={<RegisterCustomerStep2 />} />
                <Route path="/login" element={<LoginCustomer />} />
                <Route path="/farmer/info" element={<HomePageFarm/>} />
                <Route path="/farmer/register/step1" element={<RegisterFarmerStep1 />} />
                <Route path="/farmer/register/step2" element={<RegisterFarmerStep2 />} />
                <Route path="/farmer/register/step3" element={<RegisterFarmerStep3 />} />
                {/* <Route path="*" element={<NotFound />} /> */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
        </div>
    );
}
