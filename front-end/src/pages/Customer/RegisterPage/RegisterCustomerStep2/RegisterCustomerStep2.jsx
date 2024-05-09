import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../../../../App.css";
function RegisterCustomerStep2() {
  const [street, setStreet] = useState("");
  const [commune, setCommune] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [identityCard, setIdentityCard] = useState("");
  const [avatar, setAvatar] = useState(null);
  // const { userId } = useParams();
  const location = useLocation();
  console.log(location);
  const userId = new URLSearchParams(location.search).get("userid");
  const handleAvatarChange = (event) => {
    setAvatar(event.target.files[0]);
  };
  console.log(userId);
  const handleSubmit = async () => {
    try {
      const additionalData = {
        address: {
          street,
          commune,
          district,
          province,
        },
        identityCard,
      };
      // const formData = new FormData();
      // formData.append("avatar", avatar);
      // formData.append(JSON.stringify(additionalData));
      console.log(avatar);
      // Gửi yêu cầu API cho giai đoạn 2 (nhập thông tin phụ và upload avatar)
      await axios.put(
        `http://localhost:3000/api/auth/register/step2/${userId}`,
        additionalData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Đăng ký thành công!");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Đã có lỗi xảy ra!");
    }
  };

  return (
    <div className="backgroundImg">
      <div className="w-1/3 m-auto bg-fourth rounded-2xl">
        <h1 className="text-primary py-3 font-bold text-center text-40">
          Đăng ký
        </h1>
        <div className="flex justify-center px-5 my-3">
          <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
            <label
              htmlFor="street"
              className="block text-xl text-primary font-bold mb-2"
            >
              Street:
            </label>
            <input
              id="street"
              type="text"
              placeholder="Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
            />
          </div>
          <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
            <label
              htmlFor="commune"
              className="block text-xl text-primary font-bold mb-2"
            >
              Commune:
            </label>
            <input
              id="commune"
              type="text"
              placeholder="Commune"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
            />
          </div>
        </div>
        <div className="flex justify-center px-5 my-3">
          <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
            <label
              htmlFor="district"
              className="block text-xl text-primary font-bold mb-2"
            >
              District:
            </label>
            <input
              id="district"
              type="text"
              placeholder="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
            />
          </div>
          <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
            <label
              htmlFor="province"
              className="block text-xl text-primary font-bold mb-2"
            >
              Province:
            </label>
            <input
              id="province"
              type="text"
              placeholder="Province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
            />
          </div>
        </div>
        <div className="flex justify-center px-5 my-3">
          <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
            <label
              htmlFor="identityCard"
              className="block text-xl text-primary font-bold mb-2"
            >
              Identity Card:
            </label>
            <input
              id="identityCard"
              type="text"
              placeholder="Identity Card"
              value={identityCard}
              onChange={(e) => setIdentityCard(e.target.value)}
              className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
            />
          </div>
          <div className="bg-secondary w-6/12 mx-2 rounded-xl p-2">
            <label
              htmlFor="identityCard"
              className="block text-xl text-primary font-bold mb-2"
            >
              Chọn ảnh đại diện:
            </label>
            <input
              className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border "
              type="file"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
        <div className="flex items-center flex-col m-5">
          <button
            onClick={handleSubmit}
            className="bg-primary hover:opacity-90 text-white font-bold py-2 px-4 m-3 rounded-xl w-2/3"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterCustomerStep2;
