import { useEffect, useState } from "react";
import FarmerNavBar from "../../../components/FarmerComponent/FarmerNavBar/FarmerNavBar";
import HeaderFarmer from "../../../components/FarmerComponent/HeaderFarmer/HeaderFarmer";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config";
import { jwtDecode } from "jwt-decode";
import ChangeInfoFarmDialog from "../../../components/DialogFarm/ChangeInfoFarmDialog";
import ChangeLogoDialog from "../../../components/DialogFarm/ChangeLogoDialog";
import ChangeImageFarmDialog from "../../../components/DialogFarm/ChangeImageFarmDialog";

export default function FarmDetailInfo() {
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;

  const [farm, setFarm] = useState({});
  const [isOpenChangeInfo, setIsOpenChangeInfo] = useState(false);
  const [isOpenChangeLogo, setIsOpenChangeLogo] = useState(false);
  const [isOpenChangeImage, setIsOpenChangeImage] = useState(false);

  useEffect(() => {
    const fetchFarm = async () => {
      const response = await axios.get(`${API_BASE_URL}/farm/user/${userId}`);
      setFarm(response.data);
    };
    fetchFarm();
  }, [userId]);

  const refreshFarm = async () => {
    const response = await axios.get(`${API_BASE_URL}/farm/user/${userId}`);
    setFarm(response.data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderFarmer />
      <div className="flex">
        <FarmerNavBar />
        <div className="w-5/6 h-full ml-auto bg-fourth mt-14 p-8 rounded-lg shadow-2xl">
          <div className="bg-secondary w-full m-auto mt-3 rounded-t-lg shadow-lg">
            <h1 className="font-bold text-primary text-2xl p-5">
              Thông tin trang trại
            </h1>
          </div>

          <div className="bg-white p-6 rounded-b-lg shadow-lg grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột thông tin chi tiết */}
            <div className="col-span-2 space-y-6">
              {[
                { label: "Tên trang trại", value: farm.farmname },
                { label: "Diện tích", value: `${farm.farmarea} ha` },
                { label: "Số điện thoại", value: farm.farmphone },
                { label: "Email", value: farm.farmemail },
                {
                  label: "Địa chỉ",
                  value: `${farm.farmstreet}, ${farm.farmcommune}, ${farm.farmdistrict}, ${farm.farmprovince}`,
                },
                { label: "Mô tả", value: farm.farmdes },
                { label: "Dịch vụ", value: farm.farmservice },
                { label: "Lời mời hợp tác", value: farm.farminvite },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <p className="font-bold text-lg text-primary w-1/4">
                    {item.label}:
                  </p>
                  <p className="text-lg w-3/4 text-justify">
                    {item.value || "Đang cập nhật"}
                  </p>
                </div>
              ))}
              <div className="text-right mt-4">
                <button
                  className="bg-primary text-white font-bold py-2 px-5 rounded-md hover:opacity-85"
                  onClick={() => setIsOpenChangeInfo(true)}
                >
                  Thay đổi thông tin
                </button>
              </div>
            </div>

            {/* Cột hình ảnh */}
            <div className="text-center border-l-2 pl-4">
              <div className="space-y-6">
                {/* Logo */}
                <div>
                  <img
                    src={farm.farmlogo || "/default-logo.png"}
                    alt="Farm Logo"
                    className="rounded-full w-40 h-40 object-cover mx-auto shadow-lg hover:scale-105"
                  />
                  <button
                    className="mt-4 py-2 px-4 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors shadow-lg"
                    onClick={() => setIsOpenChangeLogo(true)}
                  >
                    Thay đổi logo
                  </button>
                </div>

                {/* Hình ảnh trang trại */}
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      farm.farmimage,
                      farm.farmimage1,
                      farm.farmimage2,
                      farm.farmimage3,
                    ].map((image, index) => (
                      <img
                        key={index}
                        src={image || "/default-image.png"}
                        alt={`Farm Image ${index}`}
                        className="rounded-lg w-full h-32 object-cover shadow-md hover:scale-105"
                      />
                    ))}
                  </div>
                  <button
                    className="mt-4 py-2 px-4 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors shadow-lg"
                    onClick={() => setIsOpenChangeImage(true)}
                  >
                    Thay đổi hình ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {isOpenChangeInfo && (
        <ChangeInfoFarmDialog
          onClose={() => setIsOpenChangeInfo(false)}
          farm={farm}
          refreshFarm={refreshFarm}
        />
      )}
      {isOpenChangeLogo && (
        <ChangeLogoDialog
          onClose={() => setIsOpenChangeLogo(false)}
          farm={farm}
          refreshFarm={refreshFarm}
        />
      )}
      {isOpenChangeImage && (
        <ChangeImageFarmDialog
          onClose={() => setIsOpenChangeImage(false)}
          farm={farm}
          refreshFarm={refreshFarm}
        />
      )}
    </div>
  );
}
