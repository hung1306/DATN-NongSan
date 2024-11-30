import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../../config/config";
import HeaderCustomer from "../HeaderCustomer/HeaderCustomer";
import Loading from "../../Loading";

export default function FarmInfoShow() {
  // Có 2 TH cần xử lý:
  // 1. Lấy thông tin trang trại theo productid
  // 2. Lấy thông tin trang trại theo farmid

  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const resourceType = location.pathname.split("/")[1];
  const id = location.pathname.split("/").pop();
  const isInfoPage = location.pathname.includes("/farm/info");
  const isProductDetailPage = location.pathname.includes("/farm/productdetail");

  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        setLoading(true);
        let response;
        if (resourceType === "product") {
          response = await axios.get(`${API_BASE_URL}/farm/product/${id}`);
        } else {
          response = await axios.get(`${API_BASE_URL}/farm/${id}`);
        }
        setFarm(response.data);
      } catch (error) {
        console.error("There was an error!", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmData();
  }, [resourceType, id]);
  return (
    <div>
      <HeaderCustomer />
      {loading ? (
        <div>
          <Loading />
        </div>
      ) : (
        <>
        <div className="bg-fourth mt-36 h-5"></div>
        <div className="bg-fourth">
          <div className="w-4/5 mx-auto bg-white px-3 py-5 rounded-md">
            {farm && farm.farmname && (
              <p className="font-bold text-2xl text-primary">
                Tên trang trại:{" "}
                <span className="ml-3 text-third">{farm.farmname}</span>
              </p>
            )}
          </div>

          <div className="w-4/5 bg-white rounded-md m-auto mt-1 flex items-stretch h-96 shadow-2xl">
            <div className="w-3/12 object-fit">
              <img
                src={farm?.farmlogo}
                alt="farm"
                className="object-cover h-full w-full rounded-md"
              />
            </div>
            <div className="w-9/12 object-fit">
              <img
                src={farm?.farmimage}
                alt="farm"
                className="object-cover h-full w-full rounded-md"
              />
            </div>
          </div>
          {/* Navigation */}
          <div className="w-4/5 bg-white rounded-md m-auto mt-1 flex p-5 shadow-2xl">
            <Link
              to={`/farm/info/${farm?.farmid}`}
              className={`text-2xl font-bold text-primary mx-7 ${
                isInfoPage ? "underline" : ""
              }`}
            >
              Giới thiệu trang trại
            </Link>

            <Link
              to={`/farm/productdetail/${farm?.farmid}`}
              className={`text-2xl font-bold text-primary mx-7 ${
                isProductDetailPage ? "underline" : ""
              }`}
            >
              Sản phẩm
            </Link>
          </div>
        </div>
        </>
      )}

    </div>
  );
}
