import { jwtDecode } from "jwt-decode";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
import HeaderCustomer from "../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/config";
import axios from "axios";
import { formatDate } from "../../../utils/formatDate";
import ChangePasswordDialog from "../../../components/ChangePasswordDialog";
import ChangeInfoDialog from "../../../components/ChangeInfoDialog";
import ChangeAvatarCustomerDialog from "../../../components/DialogCustomer/ChangeAvatarCustomerDialog";
// import Loading from "../../../components/Loading.jsx";
// import { useLoading } from "../../../context/LoadingContext";

export default function DetailInfoPage() {
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;

  const [user, setUser] = useState({});
  // const { loading, setLoading } = useLoading();

  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);
  const [isOpenChangeInfo, setIsOpenChangeInfo] = useState(false);
  const [isOpenChangeAvatar, setIsOpenChangeAvatar] = useState(false);

  const fetchUser = async () => {
    // setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      // setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return (
    <div>
      <HeaderCustomer />
      <div className="bg-fourth py-14">
        <div className="w-4/5 mx-auto bg-white rounded-md p-6 mt-36 shadow-2xl">
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
                    `${user.street}, ${user.commune}, ${user.district}, ${user.province}`,
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
      <FooterCustomer />

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
        <ChangeAvatarCustomerDialog
          onClose={() => setIsOpenChangeAvatar(false)}
          user={user}
          refreshUser={refreshUser}
        />
      )}
    </div>
  );
}
