import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { PropTypes } from "prop-types";
import { useState } from "react";
import { API_BASE_URL } from "../../config/config";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import Loading from "../../components/Loading";
import { useLoading } from "../../context/LoadingContext";

export default function ChangeAvatarCustomerDialog({
  onClose,
  user,
  refreshUser,
}) {
  const [avatar, setAvatar] = useState(user.avatar);
  const [avatarError, setAvatarError] = useState("");
  const { loading, setLoading } = useLoading(); // Sử dụng context loading
  const token = localStorage.getItem("accessToken");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userid;

  const validateForm = () => {
    let isValid = true;

    if (!avatar) {
      setAvatarError("Avatar is required");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatar);
      const response = await axios.put(
        `${API_BASE_URL}/user/change/avatar/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      onClose();
      toast.success(response.data.message);
      refreshUser();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-4 rounded-lg w-1/3 m-auto text-primary h-7/12 overflow-auto shadow-2xl border border-primary relative">
        <div className="flex justify-end">
          <button
            className="text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-3xl text-center font-bold">
          Thay đổi ảnh đại diện
        </h2>
        <div className="p-3 my-2">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loading />
            </div>
          ) : (
            <>
              <div className="bg-secondary m-3 flex">
                <div className="w-full">
                  <label
                    className="block text-xl text-primary font-bold mb-2"
                    htmlFor="avatar"
                  >
                    Ảnh đại diện
                  </label>
                  <input
                    type="file"
                    placeholder="avatar người dùng"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    onChange={(e) => setAvatar(e.target.files[0])}
                  />
                  {avatarError && (
                    <p className="text-red-500 italic">{avatarError}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-5">
                <button
                  className="bg-primary hover:opacity-90 text-white font-bold py-2 px-3 m-3 rounded-lg"
                  onClick={handleSubmit}
                >
                  Lưu thay đổi
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

ChangeAvatarCustomerDialog.propTypes = {
  onClose: PropTypes.func,
  user: PropTypes.object,
  refreshUser: PropTypes.func,
};
