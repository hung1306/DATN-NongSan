import { useEffect, useState } from "react";
import CategoryShow from "../../../components/CustomerComponent/CategoryShow/CategoryShow";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
import HeaderCustomer from "../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import ProductShowHome from "../../../components/CustomerComponent/ProductShowHome/ProductShowHome";
import SlideShow from "../../../components/CustomerComponent/SlideShow/SlideShow";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import Loading from "../../../components/Loading.jsx";
import PolicyShow from "../../../components/CustomerComponent/PolicyShow/PolicyShow.jsx";

function HomePage() {
  const navigate = useNavigate();
  const { toastMessage, setToastMessage } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (toastMessage) {
      toast.success(toastMessage);
      setToastMessage(null);
    }
    setLoading(false);
  }, [toastMessage, setToastMessage, navigate]);

  return (
    <div className="h-screen flex flex-col bg-fourth">
      <HeaderCustomer />
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-center my-10 mt-44 pt-10">
            <SlideShow className="w-4/5" />
            <div
              className="w-1/5 flex flex-col items-center justify-center h-full shadow-lg rounded-lg cursor-pointer"
              onClick={() => navigate("/about-agri")}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/storgeimage.appspot.com/o/SliderImage%2Fslider4.jpg?alt=media&token=135edbe7-ab5b-4145-af9e-2565f768120c"
                alt="Slider Image"
                className="w-full h-1/2 object-cover rounded-t-lg"
              />
              <div className="bg-primary cursor-pointer w-full h-1/2 rounded-b-lg p-6 hover:bg-primary-dark transition duration-300 ease-in-out shadow-lg">
                <p className="mt-3 text-secondary text-3xl text-center">
                  Tìm hiểu thêm về
                </p>
                <p className="text-4xl font-extrabold text-center text-secondary mt-2">
                  Agrimart
                </p>
              </div>
            </div>
          </div>
          <div className="w-full bg-fourth py-5">
            <div className="w-3/5 mx-auto bg-secondary px-9 py-7 rounded-lg shadow-xl">
              <h1 className="text-3xl font-bold text-primary">
                Danh mục sản phẩm
              </h1>
              <CategoryShow />
            </div>
          </div>
          <div className="w-full bg-fourth py-3">
            <div className="m-auto w-4/5 px-9 py-5 rounded-lg">
              <PolicyShow />
            </div>
            <div className="m-auto w-4/5 px-9 rounded-lg">
              <ProductShowHome />

              <div className="bg-secondary px-14 py-5 pb-14 my-5 rounded-lg shadow-xl text-center">
                <h2 className="text-3xl font-bold text-primary mb-4">
                  Đăng ký nhận tin
                </h2>
                <p className="text-primary font-medium mb-4">
                  Nhận ngay thông tin về ưu đãi và sản phẩm mới nhất!
                </p>
                <form className="flex justify-center w-full">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    className="px-4 py-2 rounded-l-lg border focus:outline-none focus:ring-2 focus:ring-primary w-9/12"
                  />
                  <button className="px-4 py-2 bg-primary text-white rounded-r-lg font-semibold hover:bg-primary-dark">
                    Đăng ký
                  </button>
                </form>
              </div>
            </div>
          </div>
          <FooterCustomer />
        </>
      )}
    </div>
  );
}

export default HomePage;
