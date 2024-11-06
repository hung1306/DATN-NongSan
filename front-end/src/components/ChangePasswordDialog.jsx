import { faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { PropTypes } from "prop-types";
import { useState } from "react";
import { API_BASE_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import Loading from "../components/Loading"; // Import Loading component
import { useLoading } from "../context/LoadingContext"; // Import useLoading

export default function ChangePasswordDialog({ onClose, userId, Role }) {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const { loading, setLoading } = useLoading(); // Sử dụng context loading

  const validateForm = () => {
    if (!oldPassword) {
      setOldPasswordError("Vui lòng nhập mật khẩu cũ.");
      setNewPasswordError("");
      setConfirmPasswordError("");
      return false;
    }

    if (!newPassword) {
      setOldPasswordError("");
      setNewPasswordError("Vui lòng nhập mật khẩu mới.");
      setConfirmPasswordError("");
      return false;
    }

    if (!confirmPassword) {
      setOldPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu mới.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setOldPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("Mật khẩu xác nhận không khớp.");
      return false;
    }
    return true;
  };

  const { setToastMessage } = useToast();
  const onChangePassword = async () => {
    try {
      if (!validateForm()) return;
      setLoading(true); // Bắt đầu loading
      // Gọi API thay đổi mật khẩu
      const response = await axios.put(`${API_BASE_URL}/user/change-password`, {
        userId: userId,
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

      onClose();
      setToastMessage(response.data.message);
      if (Role === "customer") navigate("/login");
      if (Role === "farmer") navigate("/farmer/login");
      else navigate("/shipper/login");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorPassword(error.response.data);
      setOldPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-4 rounded-lg w-1/3 m-auto text-primary h-7/12 overflow-auto shadow-xl border border-primary">
        <div className="flex justify-end">
          <button
            className="text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-3xl text-center font-bold">Thay đổi mật khẩu</h2>
        <div className="p-3 my-2">
          {loading ? (
            <Loading /> // Hiển thị component Loading khi loading là true
          ) : (
            <>
              <div className="bg-secondary mx-2">
                <label className="block text-xl text-primary font-bold mb-2">
                  Nhập mật khẩu cũ
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu cũ"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    onClick={handlePasswordVisibility}
                    className="absolute right-3 top-3 cursor-pointer"
                  />
                </div>
                {oldPasswordError && (
                  <p className="text-red-500 italic">{oldPasswordError}</p>
                )}
              </div>
              <div className="bg-secondary mx-2 my-2">
                <label className="block text-xl text-primary font-bold mb-2">
                  Nhập mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    onClick={handlePasswordVisibility}
                    className="absolute right-3 top-3 cursor-pointer"
                  />
                </div>
                {newPasswordError && (
                  <p className="text-red-500 italic">{newPasswordError}</p>
                )}
              </div>
              <div className="bg-secondary mx-2">
                <label className="block text-xl text-primary font-bold mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu mới"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    onClick={handlePasswordVisibility}
                    className="absolute right-3 top-3 cursor-pointer"
                  />
                </div>
                {confirmPasswordError && (
                  <p className="text-red-500 italic">{confirmPasswordError}</p>
                )}
                {errorPassword && (
                  <p className="text-red-500 italic">{errorPassword}</p>
                )}
              </div>
              <div className="flex justify-end mt-5">
                <button
                  className="bg-primary hover:opacity-90 text-white font-bold py-2 px-4 m-3 rounded-lg w-1/3"
                  onClick={onChangePassword}
                >
                  Lưu
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

ChangePasswordDialog.propTypes = {
  onClose: PropTypes.func,
  userId: PropTypes.string,
  Role: PropTypes.string,
};
