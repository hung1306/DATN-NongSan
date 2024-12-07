import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { PropTypes } from "prop-types";
import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/config";
import Loading from "../Loading";

export default function ChangeInfoDialog({ onClose, farm, refreshFarm }) {
  const [farmname, setFarmname] = useState(farm.farmname);
  const [farmemail, setFarmEmail] = useState(farm.farmemail);
  const [farmtype, setFarmType] = useState(farm.farmtype);
  const [farmstreet, setFarmStreet] = useState(farm.farmstreet);
  const [farmcommune, setFarmCommune] = useState(farm.farmcommune);
  const [farmdistrict, setFarmDistrict] = useState(farm.farmdistrict);
  const [farmprovince, setFarmProvince] = useState(farm.farmprovince);
  const [farmphone, setFarmPhone] = useState(farm.farmphone);
  const [farmproductstotal, setFarmProductstotal] = useState(
    farm.farmproductstotal
  );
  const [farmservice, setFarmService] = useState(farm.farmservice);
  const [farminvite, setFarmInvite] = useState(farm.farminvite);
  const [farmdes, setFarmDes] = useState(farm.farmdes);

  const [farmnameError, setFarmnameError] = useState("");
  const [farmemailError, setFarmEmailError] = useState("");
  const [farmtypeError, setFarmTypeError] = useState("");
  const [farmstreetError, setFarmStreetError] = useState("");
  const [farmcommuneError, setFarmCommuneError] = useState("");
  const [farmdistrictError, setFarmDistrictError] = useState("");
  const [farmprovinceError, setFarmProvinceError] = useState("");
  const [farmphoneError, setFarmPhoneError] = useState("");
  const [farmproductotalErrol, setFarmProductotalErrol] = useState("");
  const [farmserviceErrol, setFarmServiceErrol] = useState("");
  const [farminviteErrol, setFarmInviteErrol] = useState("");
  const [farmdesErrol, setFarmDesErrol] = useState("");

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;

    if (!farmname) {
      setFarmnameError("Vui lòng nhập tên trang trại.");
      isValid = false;
    }

    if (!farmemail) {
      setFarmEmailError("Vui lòng nhập email.");
      isValid = false;
    }

    if (!farmtype) {
      setFarmTypeError("Vui lòng nhập loại hình trang trại.");
      isValid = false;
    }

    if (!farmstreet) {
      setFarmStreetError("Vui lòng nhập địa chỉ.");
      isValid = false;
    }

    if (!farmcommune) {
      setFarmCommuneError("Vui lòng nhập phường/xã.");
      isValid = false;
    }

    if (!farmdistrict) {
      setFarmDistrictError("Vui lòng nhập quận/huyện.");
      isValid = false;
    }

    if (!farmprovince) {
      setFarmProvinceError("Vui lòng nhập tỉnh/thành phố.");
      isValid = false;
    }

    if (!farmphone) {
      setFarmPhoneError("Vui lòng nhập số điện thoại.");
      isValid = false;
    }

    if (!farmproductstotal) {
      setFarmProductotalErrol("Vui lòng nhập tổng sản phẩm.");
      isValid = false;
    }

    if (!farmservice) {
      setFarmServiceErrol("Vui lòng nhập dịch vụ của trang trại.");
      isValid = false;
    }

    if (!farminvite) {
      setFarmInviteErrol("Vui lòng nhập lời mời.");
      isValid = false;
    }

    if (!farmdes) {
      setFarmDesErrol("Vui lòng nhập mô tả.");
      isValid = false;
    }

    return isValid;
  };

  const onChangeInfo = async () => {
    try {
      if (!validateForm()) return;
      setLoading(true);
      // Gọi API thay đổi thông tin trang trại
      const response = await axios.put(`${API_BASE_URL}/farm/change-info`, {
        userId: farm.userid,
        farmname: farmname,
        farmemail: farmemail,
        farmtype: farmtype,
        farmstreet: farmstreet,
        farmcommune: farmcommune,
        farmdistrict: farmdistrict,
        farmprovince: farmprovince,
        farmphone: farmphone,
        farmproductstotal: farmproductstotal,
        farmservice: farmservice,
        farminvite: farminvite,
        farmdes: farmdes,
      });

      refreshFarm();
      onClose();
      setLoading(false);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error changing farm info:", error);
      toast.error("Có lỗi xảy ra khi thay đổi thông tin.");
    }
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-4 rounded-lg w-1/2 h-4/5 m-auto text-primary h-7/12 overflow-auto shadow-xl border border-primary">
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="flex justify-end">
              <button
                className="text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <h2 className="text-3xl text-center font-bold mb-4">
              Thay đổi thông tin trang trại
            </h2>
            <div className="p-3 my-2">
              <div className="bg-secondary m-3 flex">
                <div className="w-1/2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Tên trang trại
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên trang trại"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmname}
                    onChange={(e) => setFarmname(e.target.value)}
                  />
                  {farmnameError && (
                    <p className="text-red-500 italic">{farmnameError}</p>
                  )}
                </div>
                <div className="w-1/2 ml-2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Email trang trại
                  </label>
                  <input
                    type="email"
                    placeholder="Nhập email trang trại"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmemail}
                    onChange={(e) => setFarmEmail(e.target.value)}
                  />
                  {farmemailError && (
                    <p className="text-red-500 italic">{farmemailError}</p>
                  )}
                </div>
              </div>
              <div className="bg-secondary m-3 flex">
                <div className="w-1/2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Loại hình trang trại
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập loại hình trang trại"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmtype}
                    onChange={(e) => setFarmType(e.target.value)}
                  />
                  {farmtypeError && (
                    <p className="text-red-500 italic">{farmtypeError}</p>
                  )}
                </div>
                <div className="w-1/2 ml-2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Tên đường
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên đường"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmstreet}
                    onChange={(e) => setFarmStreet(e.target.value)}
                  />
                  {farmstreetError && (
                    <p className="text-red-500 italic">{farmstreetError}</p>
                  )}
                </div>
              </div>
              <div className="bg-secondary m-3 flex">
                <div className="w-1/2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập phường/xã"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmcommune}
                    onChange={(e) => setFarmCommune(e.target.value)}
                  />
                  {farmcommuneError && (
                    <p className="text-red-500 italic">{farmcommuneError}</p>
                  )}
                </div>
                <div className="w-1/2 ml-2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập quận/huyện"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmdistrict}
                    onChange={(e) => setFarmDistrict(e.target.value)}
                  />
                  {farmdistrictError && (
                    <p className="text-red-500 italic">{farmdistrictError}</p>
                  )}
                </div>
              </div>
              <div className="bg-secondary m-3 flex">
                <div className="w-1/2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tỉnh/thành phố"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmprovince}
                    onChange={(e) => setFarmProvince(e.target.value)}
                  />
                  {farmprovinceError && (
                    <p className="text-red-500 italic">{farmprovinceError}</p>
                  )}
                </div>
                <div className="w-1/2 ml-2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmphone}
                    onChange={(e) => setFarmPhone(e.target.value)}
                  />
                  {farmphoneError && (
                    <p className="text-red-500 italic">{farmphoneError}</p>
                  )}
                </div>
              </div>
              <div className="bg-secondary m-3 flex">
                <div className="w-1/2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Tổng sản phẩm
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tổng sản phẩm"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmproductstotal}
                    onChange={(e) => setFarmProductstotal(e.target.value)}
                  />
                  {farmproductotalErrol && (
                    <p className="text-red-500 italic">
                      {farmproductotalErrol}
                    </p>
                  )}
                </div>
                <div className="w-1/2 ml-2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Dịch vụ trang trại
                  </label>
                  <textarea
                    type="text"
                    placeholder="Nhập dịch vụ"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmservice}
                    onChange={(e) => setFarmService(e.target.value)}
                  />
                  {farmserviceErrol && (
                    <p className="text-red-500 italic">{farmserviceErrol}</p>
                  )}
                </div>
              </div>
              <div className="bg-secondary m-3 flex">
                <div className="w-1/2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Lời mời trang trại
                  </label>
                  <textarea
                    type="text"
                    placeholder="Nhập lời mời"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farminvite}
                    onChange={(e) => setFarmInvite(e.target.value)}
                  />
                  {farminviteErrol && (
                    <p className="text-red-500 italic">{farminviteErrol}</p>
                  )}
                </div>
                <div className="w-1/2 ml-2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Mô tả trang trại
                  </label>
                  <textarea
                    type="text"
                    placeholder="Nhập mô tả"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={farmdes}
                    onChange={(e) => setFarmDes(e.target.value)}
                  />
                  {farmdesErrol && (
                    <p className="text-red-500 italic">{farmdesErrol}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-5">
                <button
                  className="bg-primary hover:opacity-90 text-white font-bold py-2 px-5 m-3 rounded-lg"
                  onClick={onChangeInfo}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

ChangeInfoDialog.propTypes = {
  onClose: PropTypes.func,
  farm: PropTypes.object,
  refreshFarm: PropTypes.func,
};
