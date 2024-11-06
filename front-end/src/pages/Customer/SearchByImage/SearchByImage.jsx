import { useLocation } from "react-router-dom";
import HeaderCustomer from "./../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import ProductList from "./../../../components/CustomerComponent/ProductList/ProductList";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
const SearchByImage = () => {
    const location = useLocation();
    const { searchResults } = location.state || { searchResults: [] };
    return (
        <div className="bg-fourth">
            <HeaderCustomer />
            <div className="w-4/5 mx-auto bg-white rounded-md p-5 mt-36 shadow-2xl">
                <h1 className="font-bold text-primary text-2xl">Kết quả tìm kiếm bằng hình ảnh...</h1>
            </div>
            <div className="rounded-lg w-4/5 m-auto bg-secondary min-h-screen mt-5 mb-10 p-5 shadow-2xl">
                {searchResults.length === 0 ? (
                <p className="text-primary font-bold text-center text-2xl mt-5">Không tìm thấy sản phẩm nào</p>
                ) : (
                <ProductList products={searchResults} />
                )}
            </div>
            <FooterCustomer />
        </div>
    );
};

export default SearchByImage;
