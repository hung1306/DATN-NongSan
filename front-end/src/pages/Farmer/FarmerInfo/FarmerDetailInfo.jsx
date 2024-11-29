import { useEffect, useState } from "react";
import FarmerNavBar from "../../../components/FarmerComponent/FarmerNavBar/FarmerNavBar";
import HeaderFarmer from "../../../components/FarmerComponent/HeaderFarmer/HeaderFarmer";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config";
import { formatDate } from "../../../utils/formatDate";
import ChangePasswordDialog from "../../../components/ChangePasswordDialog";
import ChangeInfoDialog from "../../../components/ChangeInfoDialog";
import ChangeAvatarFarmDialog from "../../../components/DialogFarm/ChangeAvatarFarmDialog";

export default function FarmerDetailInfo() {
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;
  const [user, setUser] = useState({});
  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);
  const [isOpenChangeInfo, setIsOpenChangeInfo] = useState(false);
  const [isOpenChangeAvatar, setIsOpenChangeAvatar] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <div>
      <HeaderFarmer />
      <div className="flex bg-fourth pb-10">
        <FarmerNavBar />
        <div className="bg-fourth w-5/6 h-screen fixed right-0 top-0 mt-5">
          <div className="bg-white rounded-md p-6 mt-20 shadow-2xl w-11/12 m-auto">
            <h1 className="font-bold text-primary text-2xl mb-5">
              Thông tin cá nhân
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cột thông tin */}
              <div className="col-span-2 space-y-4">
                {[
                  ["Họ và tên", user.fullname],
                  ["Email", user.email],
                  ["Tên đăng nhập", user.username],
                  ["Số điện thoại", user.phonenumber],
                  [
                    "Địa chỉ",
                    `${user.street || ""}, ${user.commune || ""}, ${
                      user.district || ""
                    }, ${user.province || ""}`,
                  ],
                  ["Ngày sinh", formatDate(user.dob)],
                  ["Số CCCD", user.indentitycard],
                ].map(([label, value], idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <p className="font-bold text-lg text-primary">{label}:</p>
                    <p className="text-lg">{value || "Đang cập nhật"}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center border-b pb-2">
                  <p className="font-bold text-lg text-primary">Mật khẩu:</p>
                  <button
                    className="text-primary underline hover:opacity-75"
                    onClick={() => setIsOpenChangePassword(true)}
                  >
                    Thay đổi
                  </button>
                </div>
                <div className="text-right mt-4">
                  <button
                    className="bg-primary text-white font-bold py-2 px-5 rounded-md hover:opacity-85"
                    onClick={() => setIsOpenChangeInfo(true)}
                  >
                    Thay đổi thông tin
                  </button>
                </div>
              </div>

              {/* Cột Avatar */}
              <div className="text-center border-l-2 pl-4">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="rounded-full w-48 h-48 object-cover mx-auto mb-4"
                />
                <button
                  className="text-primary underline hover:opacity-75"
                  onClick={() => setIsOpenChangeAvatar(true)}
                >
                  Thay đổi ảnh đại diện
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {isOpenChangePassword && (
        <ChangePasswordDialog
          onClose={() => setIsOpenChangePassword(false)}
          userId={userId}
        />
      )}
      {isOpenChangeInfo && (
        <ChangeInfoDialog
          onClose={() => setIsOpenChangeInfo(false)}
          user={user}
          refreshUser={refreshUser}
        />
      )}
      {isOpenChangeAvatar && (
        <ChangeAvatarFarmDialog
          onClose={() => setIsOpenChangeAvatar(false)}
          user={user}
          userId={userId}
          refreshUser={refreshUser}
        />
      )}
    </div>
  );
}
