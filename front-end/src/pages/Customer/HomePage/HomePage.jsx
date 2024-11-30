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
          <div className="w-full bg-fourth mt-28 "></div>
          <div className="flex justify-center my-10 pt-10">
            
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
              <h1 className="text-3xl font-bold text-primary text-center">
                Danh mục sản phẩm
              </h1>
              <CategoryShow />
            </div>
          </div>
          <div className="w-full bg-fourth py-3">
            <div className="m-auto w-4/5 px-9 py-3 rounded-lg">
              <PolicyShow />
            </div>
            <div className="m-auto w-4/5 px-9 rounded-lg">
              <ProductShowHome />

              {/* <div className="w-full mx-auto mt-8 bg-white  text-primary py-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 ml-5">Tin tức nổi bật</h2>
                <div>
                  <ul className="list-disc list-inside space-y-3 ml-5 ">
                    <li>
                      <a href="/news/1" className="hover:underline">
                        Khuyến mãi lớn nhân dịp Tết Nguyên Đán!
                      </a>
                    </li>
                    <li>
                      <a href="/news/2" className="hover:underline">
                        Các loại nông sản tốt cho sức khỏe gia đình bạn.
                      </a>
                    </li>
                    <li>
                      <a href="/news/3" className="hover:underline">
                        Hành trình phát triển của Agrimart trong năm qua.
                      </a>
                    </li>
                  </ul>
                </div>
              </div> */}

              

              <div className="bg-secondary px-14 py-5 pb-14 mb-5 mt-3 rounded-lg shadow-xl text-center">
                <h2 className="text-3xl font-bold text-primary mb-4">
                  Gửi yêu cầu đến hệ thống
                </h2>

                <form className="flex justify-center w-full">
                  <input
                    placeholder="Nhập yêu cầu của bạn"
                    className="px-4 py-2 rounded-l-lg border focus:outline-none focus:ring-2 focus:ring-primary w-9/12"
                    rows="4"
                  />
                  <button className="px-6 py-2 bg-primary text-white rounded-r-lg font-semibold hover:bg-primary-dark transition duration-300 ease-in-out transform hover:scale-105">
                    Gửi yêu cầu
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
