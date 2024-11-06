import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config/config";
import Loading from "../../../components/Loading";

export default function SearchImageDialog({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null); // Lưu trữ hình ảnh được tải lên
  const [imagePreview, setImagePreview] = useState(null); // Lưu trữ URL tạm thời của hình ảnh
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Xử lý khi người dùng chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Tạo URL tạm thời cho hình ảnh
      setError('');
    } else {
      setImage(null);
      setImagePreview(null);
      setError('Vui lòng chọn một file ảnh hợp lệ.');
    }
  };

  // Gửi yêu cầu API khi người dùng nhấn nút tìm kiếm
  const handleSearch = async () => {
    if (!image) {
      setError('Vui lòng chọn một hình ảnh.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image); 

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/search-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setLoading(false);
      onClose();
      navigate('/search-image', { state: { searchResults: response.data.products } }); 
    } catch (err) {
      setLoading(false);
      setError('Có lỗi xảy ra khi tìm kiếm sản phẩm.');
      console.error(err);
    }
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-4 rounded-lg w-5/12 m-auto text-primary overflow-auto shadow-2xl border border-primary relative">
        <div className="flex justify-end">
          <button
            className="text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-3xl text-center font-bold">
          Chọn file ảnh để tìm kiếm
        </h2>
        <div className="p-3 my-2">
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="bg-secondary m-3 flex">
                <div className="w-full">
                  <label
                    className="block text-xl text-primary font-bold mb-2"
                    htmlFor="image"
                  >
                    Ảnh
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    placeholder="Chọn file ảnh"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              {imagePreview && (
                <div className="flex justify-center my-3">
                  <img src={imagePreview} alt="Preview" className="w-full h-80 object-cover rounded-lg mt-5" />
                </div>
              )}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <div className="flex justify-end mt-5">
                <button
                  className="bg-primary hover:opacity-90 text-white font-bold py-3 px-7 mx-5 rounded-lg"
                  onClick={handleSearch}
                >
                  Tìm kiếm
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

SearchImageDialog.propTypes = {
  onClose: PropTypes.func,
};