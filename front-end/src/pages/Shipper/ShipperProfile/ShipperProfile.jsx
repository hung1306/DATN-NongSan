import { useEffect, useState } from "react";
import HeaderShipper from "../../../components/ShipperComponent/HeaderShipper";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config";
import ChangePasswordDialog from "../../../components/ChangePasswordDialog";
import ChangeInfoDialog from "../../../components/ChangeInfoDialog";
import ChangeAvatarDialog from "../../../components/DialogShipper/ChangeAvatarDialog";
import { ToastContainer, toast } from "react-toastify";
export default function ShipperProfile() {
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;
  const [shipper, setShipper] = useState({});

  const [newStatus, setNewStatus] = useState("");
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  useEffect(() => {
    const fetchShipper = async () => {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setShipper(response.data);
    };

    fetchShipper();
  }, [userId]);

  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);
  const openChangePasswordDialog = () => setIsOpenChangePassword(true);

  const [isOpenChangeInfo, setIsOpenChangeInfo] = useState(false);
  const openChangeInfoDialog = () => setIsOpenChangeInfo(true);

  const [isOpenChangeAvatar, setIsOpenChangeAvatar] = useState(false);
  const openChangeAvatarDialog = () => setIsOpenChangeAvatar(true);

  const refreshShipper = async () => {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
    setShipper(response.data);
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`${API_BASE_URL}/shipper/updatestatus/${userId}`, {
        shipperstatus: newStatus,
      });
      setIsEditingStatus(false);
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setShipper(response.data);
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  return (
    <div>
      <HeaderShipper />
      <ToastContainer />
      <div className="flex">
        <div className="bg-fourth w-full h-screen fixed right-0 top-0 mt-20">
          <div className="bg-secondary w-11/12 m-auto mt-3 rounded-lg shadow-2xl">
            <h1 className="font-bold text-primary text-2xl p-5">
              Thông tin Shipper
            </h1>
          </div>
          <div className="bg-secondary w-11/12 m-auto mt-3 rounded-lg p-5 shadow-2xl">
            {shipper && (
              <div className="flex flex-wrap justify-between">
                <div className="p-5 flex flex-col w-7/12">
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Họ và tên:
                    </p>
                    <p className="text-xl p-3 font-medium">
                      {shipper.fullname}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">Email:</p>
                    <p className="text-xl p-3 font-medium">{shipper.email}</p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Tên đăng nhập:
                    </p>
                    <p className="text-xl p-3 font-medium">
                      {shipper.username}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Mật khẩu
                    </p>
                    <p
                      className="text-xl p-3 text-primary cursor-pointer italic font-medium hover:opacity-85"
                      onClick={() => openChangePasswordDialog()}
                    >
                      Thay đổi
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Số điện thoại:
                    </p>
                    <p className="text-xl p-3 font-medium">
                      {shipper.phonenumber}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Khu vực giao hàng:
                    </p>
                    <p className="text-xl p-3 font-medium">
                      {shipper.deliveryarea}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold text-xl p-3 text-primary">
                      Trạng thái:
                    </p>
                    {isEditingStatus ? (
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="text-xl p-2 border rounded"
                      >
                        <option value="Không sẵn sàng">Không sẵn sàng</option>
                        <option value="Đang chờ">Đang chờ</option>
                        <option value="Đang giao">Đang giao</option>
                      </select>
                    ) : (
                      <p className="text-xl p-3 font-medium">
                        {shipper.shipperstatus}
                      </p>
                    )}
                    <button
                      onClick={() =>
                        isEditingStatus
                          ? handleUpdateStatus()
                          : setIsEditingStatus(true)
                      }
                      className="font-bold text-primary text-xl p-3 ml-3 cursor-pointer"
                    >
                      {isEditingStatus ? "Lưu" : "Cập nhật"}
                    </button>
                  </div>
                  <div className="flex justify-end w-2/3">
                    <button
                      className="bg-primary text-secondary font-bold text-xl py-2 px-5 rounded-lg mt-5 hover:opacity-85"
                      onClick={openChangeInfoDialog}
                    >
                      Thay đổi thông tin
                    </button>
                  </div>
                </div>
                <div className="p-5 w-4/12 border-l-2 border-primary">
                  <div className="flex flex-col items-center">
                    <img
                      src={shipper.avatar}
                      alt="avatar"
                      className="rounded-full w-2/3"
                    />
                    <button
                      className="font-bold text-primary text-xl hover:opacity-85 mt-5"
                      onClick={openChangeAvatarDialog}
                    >
                      Thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isOpenChangePassword && (
        <ChangePasswordDialog
          onClose={() => setIsOpenChangePassword(false)}
          userId={userId}
        />
      )}
      {isOpenChangeInfo && (
        <ChangeInfoDialog
          onClose={() => setIsOpenChangeInfo(false)}
          user={shipper}
          refreshUser={refreshShipper}
        />
      )}
      {isOpenChangeAvatar && (
        <ChangeAvatarDialog
          onClose={() => setIsOpenChangeAvatar(false)}
          user={shipper}
          userId={userId}
          refreshUser={refreshShipper}
        />
      )}
    </div>
  );
}
