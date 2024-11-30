import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import FarmInfoShow from "../../../components/CustomerComponent/FarmInfoShow/FarmInfoShow.jsx";
import { API_BASE_URL } from "../../../config/config.js";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import Loading from "../../../components/Loading.jsx";

export default function FarmInfoPage() {
  const [farmData, setFarmData] = useState(null);
  // const [product, setProduct] = useState([]);
  let { id } = useParams();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/farm/info/${id}`)
      .then((response) => {
        setFarmData(response.data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <div>
      <FarmInfoShow />
      <div className="bg-fourth m-auto flex flex-wrap justify-center">
        {loading ? (
          <div>
            <Loading />
          </div>
        ) : (
          <>
            <div className="container mx-auto p-5 mt-3 bg-white rounded-lg shadow-2xl w-4/5 text-primary text-justify">
              {/* Nội dung farm */}
              <div className="mb-5">
                <h2 className="text-2xl font-bold mb-3">Mô tả về trang trại</h2>
                <p className="text-lg">{farmData?.farmdes}</p>

                <h2 className="text-2xl font-bold mb-3 mt-5">
                  Sản phẩm trang trại cung cấp
                </h2>
                <p className="text-lg">{farmData?.farmservice}</p>

                <h2 className="text-2xl font-bold mb-3 mt-5">
                  Lời mời gọi liên kết
                </h2>
                <p className="text-lg">{farmData?.farminvite}</p>
              </div>

              {/* Hình ảnh */}
              <h2 className="text-2xl font-bold mb-3 mt-5">
                Một số hình ảnh của trang trại
              </h2>
              <div className="my-8 w-full flex justify-center gap-6 h-64">
                <img
                  src={farmData?.farmimage1}
                  alt="farm image 1"
                  className="object-cover rounded-lg w-1/3 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                />
                <img
                  src={farmData?.farmimage2}
                  alt="farm image 2"
                  className="object-cover rounded-lg w-1/3 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                />
                <img
                  src={farmData?.farmimage3}
                  alt="farm image 3"
                  className="object-cover rounded-lg w-1/3 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Thông tin liên hệ và tổng số sản phẩm */}
            <div className="container mx-auto p-8 mt-2 mb-10 bg-white rounded-lg shadow-2xl w-4/5 text-primary">
              <h2 className="text-2xl font-bold mb-2"> Thông tin liên hệ</h2>
              <p className="text-lg">
                {" "}
                <FontAwesomeIcon icon={faPhone} className="mr-3 text-xl" />
                <span className="font-medium">Số điện thoại:</span>{" "}
                {farmData?.farmphone}
              </p>
              <p className="text-lg">
                <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-xl" />
                <span className="font-medium">Email:</span>{" "}
                {farmData?.farmemail}
              </p>
              <p className="text-lg">
                {" "}
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="mr-3 text-xl"
                />
                <span className="font-medium">Tỉnh/Thành phố:</span>{" "}
                {farmData?.farmprovince}
              </p>
              {/* Số sản phẩm */}
            </div>
          </>
        )}
      </div>
      <FooterCustomer />
    </div>
  );
}
