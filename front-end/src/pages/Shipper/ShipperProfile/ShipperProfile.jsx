import { useEffect, useState } from "react";
import HeaderShipper from "../../../components/ShipperComponent/HeaderShipper";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config";
import ChangePasswordDialog from "../../../components/ChangePasswordDialog";
import ChangeInfoDialog from "../../../components/ChangeInfoDialog";
import ChangeAvatarDialog from "../../../components/DialogShipper/ChangeAvatarDialog";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/formatDate";

export default function ShipperProfile() {
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;
  const [shipper, setShipper] = useState({});

  const [newStatus, setNewStatus] = useState(shipper.shipperstatus);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  useEffect(() => {
    const fetchShipper = async () => {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setShipper(response.data);
      setNewStatus(response.data.shipperstatus);
    };

    fetchShipper();
  }, [userId]);

  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);
  const [isOpenChangeInfo, setIsOpenChangeInfo] = useState(false);
  const [isOpenChangeAvatar, setIsOpenChangeAvatar] = useState(false);

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
      toast.success("Cập nhật trạng thái giao hàng thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  return (
    <div>
      <HeaderShipper />
      <div className="bg-fourth py-14 h-screen">
        <div className="w-4/5 mx-auto bg-white rounded-md p-6 mt-12 shadow-2xl">
          <h1 className="font-bold text-primary text-2xl mb-5">
            Thông tin cá nhân
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột thông tin */}
            <div className="col-span-2 space-y-4">
              {[
                ["Họ và tên", shipper.fullname],
                ["Email", shipper.email],
                ["Tên đăng nhập", shipper.username],
                ["Số điện thoại", shipper.phonenumber],
                ["Khu vực giao hàng", shipper.deliveryarea],
                ["Ngày sinh", formatDate(shipper.dob)],
                ["Số CCCD", shipper.indentitycard],
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
              <div className="flex justify-between items-center border-b pb-2">
                <p className="font-bold text-lg text-primary">
                  Trạng thái giao hàng:
                </p>
                <div className="flex">
                  {isEditingStatus ? (
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="text-lg p-2 border rounded"
                    >
                      <option value="Không sẵn sàng">Không sẵn sàng</option>
                      <option value="Đang chờ">Đang chờ</option>
                      <option value="Đang giao">Đang giao</option>
                    </select>
                  ) : (
                    <p className="text-lg">{shipper.shipperstatus}</p>
                  )}
                  <button
                    onClick={() =>
                      isEditingStatus
                        ? handleUpdateStatus()
                        : setIsEditingStatus(true)
                    }
                    className="font-bold text-primary text-lg  ml-3 cursor-pointer"
                  >
                    {isEditingStatus ? "Lưu" : "Cập nhật"}
                  </button>
                </div>
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
                src={shipper.avatar || "/default-avatar.png"}
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
