import { jwtDecode } from "jwt-decode";
import FooterCustomer from "../../../components/CustomerComponent/FooterCustomer/FooterCustomer";
import HeaderCustomer from "../../../components/CustomerComponent/HeaderCustomer/HeaderCustomer";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/config";
import axios from "axios";
import { formatDate } from "./../../../utils/formatDate";
import ChangePasswordDialog from "../../../components/ChangePasswordDialog";
import ChangeInfoDialog from "../../../components/ChangeInfoDialog";
import ChangeAvatarCustomerDialog from "../../../components/DialogCustomer/ChangeAvatarCustomerDialog";
import Loading from "../../../components/Loading.jsx"; 
import { useLoading } from "../../../context/LoadingContext";

export default function DetailInfoPage() {
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;
  const [user, setUser] = useState({});
  const { loading, setLoading } = useLoading(); // Sử dụng context loading

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); // Set loading to true before API call
      try {
        const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after API call
      }
    };

    fetchUser();
  }, [userId, setLoading]);

  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);
  const openChangePasswordDialog = () => {
    setIsOpenChangePassword(true);
  };

  const [isOpenChangeInfo, setIsOpenChangeInfo] = useState(false);
  const openChangeInfoDialog = () => {
    setIsOpenChangeInfo(true);
  };

  const [isOpenChangeAvatar, setIsOpenChangeAvatar] = useState(false);
  const openChangeAvatarDialog = () => {
    setIsOpenChangeAvatar(true);
  };

  const refreshUser = async () => {
    setLoading(true); // Set loading to true before API call
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setLoading(false); // Set loading to false after API call
    }
  };

  return (
    <div>
      <HeaderCustomer />
      <div className="bg-fourth pb-7">
        <div className="w-4/5 mx-auto bg-white rounded-md p-5 mt-36 shadow-2xl">
          <h1 className="font-bold text-primary text-2xl">Thông tin cá nhân</h1>
        </div>
        <div className="rounded-lg w-4/5 m-auto bg-secondary mt-5 p-5 shadow-2xl">
          {loading ? (
            <Loading /> 
          ) : (
            user && (
              <div className="flex flex-wrap justify-between ">
                <div className="p-5 flex flex-col w-7/12">
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Họ và tên:{" "}
                    </p>
                    <p className="text-xl p-3 font-medium">{user.fullname}</p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">Email: </p>
                    <p className="text-xl p-3 font-medium">{user.email}</p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Tên đăng nhập:{" "}
                    </p>
                    <p className="text-xl p-3 font-medium">{user.username}</p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">Mật khẩu</p>
                    <p
                      className="text-xl p-3 text-primary cursor-pointer italic font-medium hover:opacity-85"
                      onClick={() => openChangePasswordDialog()}
                    >
                      Thay đổi
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Số điện thoại:{" "}
                    </p>
                    <p className="text-xl p-3 font-medium">{user.phonenumber}</p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Địa chỉ:{" "}
                    </p>
                    <p className="text-xl p-3 font-medium">
                      {user.street +
                        ", " +
                        user.commune +
                        ", " +
                        user.district +
                        ", " +
                        user.province +
                        "."}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Ngày sinh:
                    </p>
                    <p className="text-xl p-3 font-medium">
                      {formatDate(user.dob)}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">Số CCCD:</p>
                    <p className="text-xl p-3 font-medium">
                      {user.indentitycard}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="bg-primary text-secondary font-bold text-xl py-2 px-5 rounded-lg mt-5 hover:opacity-85"
                      onClick={() => openChangeInfoDialog()}
                    >
                      Thay đổi thông tin
                    </button>
                  </div>
                </div>

                <div className="p-5 w-4/12 border-l-2 border-primary">
                  <div className="flex flex-col items-center">
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="rounded-full w-60 h-60 object-cover"
                    />
                    <button
                      className="font-bold text-primary text-xl hover:opacity-75 mt-5"
                      onClick={() => openChangeAvatarDialog()}
                    >
                      Thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <FooterCustomer />
      {isOpenChangePassword && (
        <ChangePasswordDialog
          onClose={() => setIsOpenChangePassword(false)}
          userId={userId}
          Role={user.role}
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