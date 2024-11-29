import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faShoppingCart,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../../../../App.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { API_BASE_URL } from "./../../../../config/config";
import { useToast } from "../../../../context/ToastContext";
import Loading from "../../../../components/Loading";

export default function FarmerRegisterStep2() {
  const [farmname, setFarmName] = useState("");
  const [farmtype, setFarmType] = useState("");
  const [farmemail, setFarmemail] = useState("");
  const [farmarea, setFarmArea] = useState("");
  const [farmdescription, setFarmDescription] = useState("");
  const [farmstreet, setStreet] = useState("");
  const [farmcommune, setCommune] = useState("");
  const [farmdistrict, setDistrict] = useState("");
  const [farmprovince, setProvince] = useState("");

  const [farmphone, setFarmPhone] = useState("");
  const [farmproductstotal, setFarmProductTotal] = useState("");
  const [farmservice, setFarmservice] = useState("");
  const [farminvite, setFarminVite] = useState("");
  const [farmlogo, setFarmLogo] = useState("");
  const [farmimage, setFarmImage] = useState("");
  const [farmimage1, setFarmImage1] = useState("");
  const [farmimage2, setFarmImage2] = useState("");
  const [farmimage3, setFarmImage3] = useState("");

  const [farmNameError, setFarmNameError] = useState("");
  const [farmTypeError, setFarmTypeError] = useState("");
  const [farmemailError, setFarmemailError] = useState("");
  const [farmAreaError, setFarmAreaError] = useState("");
  const [farmDescriptionError, setFarmDescriptionError] = useState("");
  const [streetError, setStreetError] = useState("");
  const [communeError, setCommuneError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [provinceError, setProvinceError] = useState("");

  const [farmphoneErrol, setFarmPhoneErrol] = useState("");
  const [farmproductotalErrol, setFarmProductTotalErrol] = useState("");
  const [farmserviceErrol, setFarmServiceErrol] = useState("");
  const [farminviteErrol, setFarminViteErrol] = useState("");
  const [farmlogoErrol, setFarmLogoErrol] = useState("");
  const [farmimageErrol, setFarmImageErrol] = useState("");
  const [farmimage1Errol, setFarmImage1Errol] = useState("");
  const [farmimage2Errol, setFarmImage2Errol] = useState("");
  const [farmimage3Errol, setFarmImage3Errol] = useState("");

  const location = useLocation();
  const userId = new URLSearchParams(location.search).get("userid");
  const navigate = useNavigate();
  const { toastMessage, setToastMessage } = useToast();
  useEffect(() => {
    if (toastMessage) {
      toast.success(toastMessage);
      setToastMessage(null);
    }
  }, [toastMessage, setToastMessage, navigate]);

  const validate = () => {
    let isValid = true;

    // Reset errors
    setFarmNameError("");
    setFarmTypeError("");
    setFarmemailError("");
    setFarmAreaError("");
    setFarmDescriptionError("");

    if (farmname.trim() === "") {
      setFarmNameError("Vui lòng nhập tên trang trại");
      isValid = false;
    }

    // Validate farm type
    if (farmtype.trim() === "") {
      setFarmTypeError("Vui lòng nhập loại trang trại");
      isValid = false;
    }

    // Validate contact name
    if (farmemail.trim() === "") {
      setFarmemailError("Vui lòng nhập tên người liên hệ");
      isValid = false;
    }

    // Validate ID number

    // Validate farm scale
    if (farmarea.trim() === "") {
      setFarmAreaError("Vui lòng nhập quy mô trang trại");
      isValid = false;
    }

    // Validate farm description
    if (farmdescription.trim() === "") {
      setFarmDescriptionError("Vui lòng nhập mô tả trang trại");
      isValid = false;
    }

    if (!farmstreet) {
      setStreetError("Tên đường là bắt buộc");
      isValid = false;
    } else {
      setStreetError("");
    }

    if (!farmcommune) {
      setCommuneError("Tên phường/xã là bắt buộc");
      isValid = false;
    } else {
      setCommuneError("");
    }

    if (!farmdistrict) {
      setDistrictError("Quận/Huyện là bắt buộc");
      isValid = false;
    } else {
      setDistrictError("");
    }

    if (!farmprovince) {
      setProvinceError("Tỉnh/Thành phố là bắt buộc");
      isValid = false;
    } else {
      setProvinceError("");
    }

    if (!farmphone) {
      setFarmPhoneErrol("Số điện thoại liên hệ là bắt buộc");
      isValid = false;
    } else {
      setFarmPhoneErrol("");
    }

    if (!farmproductstotal) {
      setFarmProductTotalErrol("Số lượng sản phẩm là bắt buộc");
      isValid = false;
    } else {
      setFarmProductTotalErrol("");
    }

    if (!farmservice) {
      setFarmServiceErrol("Dịch vụ của trang trại là bắt buộc");
      isValid = false;
    } else {
      setFarmServiceErrol("");
    }

    if (!farminvite) {
      setFarminViteErrol("Lời mời gọi khách hàng là bắt buộc");
      isValid = false;
    } else {
      setFarminViteErrol("");
    }

    if (!farmlogo) {
      setFarmLogoErrol("Logo trang trại là bắt buộc");
      isValid = false;
    } else {
      setFarmLogoErrol("");
    }

    if (!farmimage) {
      setFarmImageErrol("Hình ảnh trang trại là bắt buộc");
      isValid = false;
    } else {
      setFarmImageErrol("");
    }

    if (!farmimage1) {
      setFarmImage1Errol("Hình ảnh 1 trang trại là bắt buộc");
      isValid = false;
    } else {
      setFarmImage1Errol("");
    }

    if (!farmimage2) {
      setFarmImage2Errol("Hình ảnh 2 trang trại là bắt buộc");
      isValid = false;
    } else {
      setFarmImage2Errol("");
    }

    if (!farmimage3) {
      setFarmImage3Errol("Hình ảnh 3 trang trại là bắt buộc");
      isValid = false;
    } else {
      setFarmImage3Errol("");
    }
    return isValid;
  };
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    // Validate input fields here
    try {
      if (!validate()) {
        return;
      }
      setLoading(true);
      const formData = new FormData();
      formData.append("farmname", farmname);
      formData.append("farmtype", farmtype);
      formData.append("farmemail", farmemail);
      formData.append("farmarea", farmarea);
      formData.append("farmdescription", farmdescription);
      formData.append("farmstreet", farmstreet);
      formData.append("farmcommune", farmcommune);
      formData.append("farmdistrict", farmdistrict);
      formData.append("farmprovince", farmprovince);
      formData.append("farmphone", farmphone);
      formData.append("farmproductstotal", farmproductstotal);
      formData.append("farmservice", farmservice);
      formData.append("farminvite", farminvite);

      if (farmlogo) {
        formData.append("farmlogo", farmlogo);
      }
      if (farmimage) {
        formData.append("farmimage", farmimage);
      }
      if (farmimage1) {
        formData.append("farmimage1", farmimage1);
      }
      if (farmimage2) {
        formData.append("farmimage2", farmimage2);
      }
      if (farmimage3) {
        formData.append("farmimage3", farmimage3);
      }

      // Gửi yêu cầu API cho giai đoạn 1 (nhập thông tin cơ bản)
      const response = await axios.post(
        `${API_BASE_URL}/auth/farmer/register/step2/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Điều hướng sang trang nhập thông tin phụ
      setToastMessage(response.data.message);
      navigate(`/farmer/register/step3?userId=${userId}`);
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-fourth flex flex-col">
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loading />
        </div>
      ) : (
        <>
          <ToastContainer />
          <div className=" bg-fourth px-10 py-3">
          <div className="bg-white ml-10 mr-10  flex flex-col py-2 rounded-xl shadow-2xl">
              <p className="text-center text-2xl text-primary font-bold p-2">
                ĐĂNG KÝ ĐỂ ĐƯA NÔNG SẢN CỦA BẠN ĐẾN VỚI NGƯỜI TIÊU DÙNG KHẮP NƠI
                TRÊN LÃNH THỔ VIỆT NAM
              </p>
            </div>

            {/* Register form */}
            <div className="bg-white mt-5 ml-10 mr-10 flex justify-center py-10 rounded-xl shadow-2xl">
              {/* Icon tài khoản */}
              <div className="mr-40 relative flex flex-col items-center">
                {/* Icon */}
                <FontAwesomeIcon
                  icon={faUser}
                  className=" text-4xl"
                />
                <p className="text-center mt-2">Đăng ký tài khoản</p>
                {/* Đường kẻ */}
                <div className="absolute top-1/2 left-full transform -translate-y-1/2 h-0.5 bg-gray-900 w-40  "></div>
              </div>

              {/* Icon giỏ hàng */}
              <div className="mr-40 relative flex flex-col items-center">
                {/* Icon */}
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  className=" text-green-600 text-4xl"
                />
                <p className="text-center text-green-600 mt-2 font-bold">
                  Đăng ký trang trại
                </p>
                {/* Đường kẻ */}
                <div className="absolute top-1/2 left-full transform -translate-y-1/2 h-0.5 bg-gray-900 w-40"></div>
              </div>

              {/* Icon hoàn thành */}
              <div className="relative flex flex-col items-center">
                {/* Icon */}
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className=" text-4xl"
                />
                <p className="text-center mt-2">Hoàn thành</p>
              </div>
            </div>

            <div className="flex  ml-10 mr-10 mb-5 py-5 px-10 rounded-xl">
              {/* Left section - Input form */}
              <div className="w-1/2 bg-white p-10  mr-5 rounded-lg shadow-2xl">
                {/* Form fields */}
                <div className="mb-4">
                  <label
                    htmlFor="farmName"
                    className="block text-primary font-bold mb-2"
                  >
                    Tên trang trại:
                  </label>
                  <input
                    type="text"
                    id="farmName"
                    placeholder="Tên trang trại"
                    value={farmname}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {farmNameError && (
                    <p className="text-red-500 text-sm italic">
                      {farmNameError}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmType"
                    className="block text-primary font-bold mb-2"
                  >
                    Loại trang trại:
                  </label>
                  <input
                    type="text"
                    id="farmType"
                    placeholder="Loại trang trại"
                    value={farmtype}
                    onChange={(e) => setFarmType(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {farmTypeError && (
                    <p className="text-red-500 text-sm italic">
                      {farmTypeError}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmemail"
                    className="block text-primary font-bold mb-2"
                  >
                    Email trang trại:
                  </label>
                  <input
                    type="text"
                    id="farmemail"
                    placeholder="Email của trang trại"
                    value={farmemail}
                    onChange={(e) => setFarmemail(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {farmemailError && (
                    <p className="text-red-500 text-sm italic">
                      {farmemailError}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="farmstreet"
                    className="block text-primary font-bold mb-2"
                  >
                    Tên đường:
                  </label>
                  <input
                    type="text"
                    id="farmstreet"
                    placeholder="Tên đường"
                    value={farmstreet}
                    onChange={(e) => setStreet(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {streetError && (
                    <p className="text-red-500 text-sm italic">{streetError}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmommune"
                    className="block text-primary font-bold mb-2"
                  >
                    Tên xã/phường:
                  </label>
                  <input
                    type="text"
                    id="farmcommune"
                    placeholder="Xã/Phường"
                    value={farmcommune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {communeError && (
                    <p className="text-red-500 text-sm italic">
                      {communeError}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmdistrict"
                    className="block text-primary font-bold mb-2"
                  >
                    Tên quận/huyện:
                  </label>
                  <input
                    type="text"
                    id="farmdistrict"
                    placeholder="Quận/Huyện"
                    value={farmdistrict}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {districtError && (
                    <p className="text-red-500 text-sm italic">
                      {districtError}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmprovince"
                    className="block text-primary font-bold mb-2"
                  >
                    Tên tỉnh/thành phố:
                  </label>
                  <input
                    type="text"
                    id="farmprovince"
                    placeholder="Tỉnh/Thành phố"
                    value={farmprovince}
                    onChange={(e) => setProvince(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {provinceError && (
                    <p className="text-red-500 text-sm italic">
                      {provinceError}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmArea"
                    className="block text-primary font-bold mb-2"
                  >
                    Quy mô trang trại:
                  </label>
                  <input
                    type="text"
                    id="farmArea"
                    placeholder="Quy mô trang trại (m2)"
                    value={farmarea}
                    onChange={(e) => setFarmArea(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {farmAreaError && (
                    <p className="text-red-500 text-sm italic">
                      {farmAreaError}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmDescription"
                    className="block text-primary font-bold mb-2"
                  >
                    Mô tả trang trại:
                  </label>
                  <textarea
                    id="farmDescription"
                    placeholder="Mô tả trang trại"
                    value={farmdescription}
                    onChange={(e) => setFarmDescription(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {farmDescriptionError && (
                    <p className="text-red-500 text-sm italic">
                      {farmDescriptionError}
                    </p>
                  )}
                </div>

                {/* bổ sung */}

                <div className="mb-4">
                  <label
                    htmlFor="farmphone"
                    className="block text-primary font-bold mb-2"
                  >
                    Số điện thoại:
                  </label>
                  <input
                    type="text"
                    id="farmphone"
                    placeholder="Số điện thoại"
                    value={farmphone}
                    onChange={(e) => setFarmPhone(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {farmphoneErrol && (
                    <p className="text-red-500 text-sm italic">
                      {farmphoneErrol}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmproductstotal"
                    className="block text-primary font-bold mb-2"
                  >
                    Số loại sản phẩm:
                  </label>
                  <input
                    type="number"
                    id="farmproductotal"
                    placeholder="Số loại sản phẩm"
                    value={farmproductstotal}
                    onChange={(e) => setFarmProductTotal(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {farmproductotalErrol && (
                    <p className="text-red-500 text-sm italic">
                      {farmproductotalErrol}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmservice"
                    className="block text-primary font-bold mb-2"
                  >
                    Dịch vụ trang trại:
                  </label>
                  <textarea
                    type="text"
                    id="farmservice"
                    placeholder="Dịch vụ trang trại"
                    value={farmservice}
                    onChange={(e) => setFarmservice(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {farmserviceErrol && (
                    <p className="text-red-500 text-sm italic">
                      {farmserviceErrol}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farminvite"
                    className="block text-primary font-bold mb-2"
                  >
                    Lời mời gọi:
                  </label>
                  <textarea
                    type="text"
                    id="farminvite"
                    placeholder="Lời mời gọi"
                    value={farminvite}
                    onChange={(e) => setFarminVite(e.target.value)}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {farminviteErrol && (
                    <p className="text-red-500 text-sm italic">
                      {farminviteErrol}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmlogo"
                    className="block text-primary font-bold mb-2"
                  >
                    Logo nông trại:
                  </label>
                  <input
                    type="file"
                    id="farmlogo"
                    placeholder="Logo nông trại"
                    onChange={(e) => setFarmLogo(e.target.files[0])}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {
                    <p className="text-red-500 text-sm italic">
                      {farmlogoErrol}
                    </p>
                  }
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmimage"
                    className="block text-primary font-bold mb-2"
                  >
                    Ảnh đại diện nông trại:
                  </label>
                  <input
                    type="file"
                    id="farmimage"
                    placeholder="Ảnh đại diện nông trại"
                    onChange={(e) => setFarmImage(e.target.files[0])}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {
                    <p className="text-red-500 text-sm italic">
                      {farmimageErrol}
                    </p>
                  }
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmimage1"
                    className="block text-primary font-bold mb-2"
                  >
                    Hình ảnh 1:
                  </label>
                  <input
                    type="file"
                    id="farmimage1"
                    placeholder="Hình ảnh 2"
                    onChange={(e) => setFarmImage1(e.target.files[0])}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {
                    <p className="text-red-500 text-sm italic">
                      {farmimage1Errol}
                    </p>
                  }
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmimage2"
                    className="block text-primary font-bold mb-2"
                  >
                    Hình ảnh 2:
                  </label>
                  <input
                    type="file"
                    id="farmimage2"
                    placeholder="Hình ảnh 2"
                    onChange={(e) => setFarmImage2(e.target.files[0])}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {
                    <p className="text-red-500 text-sm italic">
                      {farmimage2Errol}
                    </p>
                  }
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="farmimage3"
                    className="block text-primary font-bold mb-2"
                  >
                    Hình ảnh 3:
                  </label>
                  <input
                    type="file"
                    id="farmimage3"
                    placeholder="Hình ảnh 3"
                    onChange={(e) => setFarmImage3(e.target.files[0])}
                    className="border border-fourth rounded-2xl py-2 px-3 w-full text-primary"
                  />
                  {
                    <p className="text-red-500 text-sm italic">
                      {farmimage3Errol}
                    </p>
                  }
                </div>

                <div className="flex mt-4 w-full justify-end">
                  <button
                    onClick={handleNext}
                    className="bg-primary text-white font-bold hover:opacity-95 py-3 w-full px-4 rounded-xl my-2"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>

              {/* Right section - Image and text */}
              <div className="w-1/2 flex flex-col items-center justify-start mt-20">
                <h2 className="text-2xl font-bold mb-4 text-center text-primary">
                  ĐĂNG KÝ THÔNG TIN TRANG TRẠI
                </h2>
                <p className="text-primary text-xl mb-6 text-center font-semibold">
                  Hãy điền thông tin chi tiết về trang trại của bạn để bắt đầu
                  hành trình cung cấp sản phẩm tươi ngon đến người tiêu dùng.
                </p>
                <img
                  src="/src/assets/logimFarmer.jpg"
                  alt="Đăng ký"
                  className="rounded-lg w-3/4 h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
