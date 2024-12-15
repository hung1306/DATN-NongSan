import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { PropTypes } from "prop-types";
import { useState } from "react";
import { API_BASE_URL } from "../../../../front-end/src/config/config";
import { toast } from "react-toastify";

export default function CreateProductBatch({ onClose, producid }) {
  const [productBatch, setProductBatch] = useState({
    unitofmeasure: "",
    batchquantity: "",
    // batchquality: "",
    plantingdate: "",
    harvestdate: "",
    expirydate: "",
    batchprice: "",
    // promotion: "",
  });

  const [productBatchError, setProductBatchError] = useState({
    unitofmeasure: "",
    batchquantity: "",
    // batchquality: "",
    plantingdate: "",
    harvestdate: "",
    expirydate: "",
    batchprice: "",
    // promotion: "",
  });

  // Hàm check lỗi dữ liệu đầu vào
  const validate = () => {
    let isError = false;
    const errors = {
      unitofmeasure: "",
      batchquantity: "",
      // batchquality: "",
      plantingdate: "",
      harvestdate: "",
      expirydate: "",
      batchprice: "",
      // promotion: "",
    };

    if (productBatch.unitofmeasure === "") {
      isError = true;
      errors.unitofmeasure = "Tên lô hàng không được để trống";
    }

    if (productBatch.batchquantity === "") {
      isError = true;
      errors.batchquantity = "Số lượng lô hàng không được để trống";
    }

    // if (productBatch.batchquality === "") {
    //   isError = true;
    //   errors.batchquality = "Chất lượng lô hàng không được để trống";
    // }

    if (productBatch.plantingdate === "") {
      isError = true;
      errors.plantingdate = "Ngày trồng không được để trống";
    }

    if (productBatch.harvestdate === "") {
      isError = true;
      errors.harvestdate = "Ngày thu hoạch không được để trống";
    }

    if (productBatch.expirydate === "") {
      isError = true;
      errors.expirydate = "Ngày hết hạn không được để trống";
    }

    if (productBatch.batchprice === "") {
      isError = true;
      errors.batchprice = "Giá lô hàng không được để trống";
    }

    // if (productBatch.promotion === "") {
    //   isError = true;
    //   errors.promotion = "Giảm giá không được để trống";
    // }

    setProductBatchError(errors);
    return isError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductBatch((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const err = validate();
    if (!err) {
      console.log(productBatch);
    }

    // Gọi API tạo lô hàng mới
    const response = await axios.post(
      `${API_BASE_URL}/create/product-batch/${producid}`,
      {
        unitofmeasure: productBatch.unitofmeasure,
        batchquantity: productBatch.batchquantity,
        // batchquality: productBatch.batchquality,
        plantingdate: productBatch.plantingdate,
        harvestdate: productBatch.harvestdate,
        expirydate: productBatch.expirydate,
        batchprice: productBatch.batchprice,
        // promotion: productBatch.promotion,
      }
    );
    if (response.status === 200) {
      onClose();
      toast.success("Tạo lô hàng mới thành công");
    }
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-6 rounded w-1/2 m-auto overflow-auto shadow-xl">
        <div className="flex justify-end">
          <button
            className="text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-3xl text-center text-primary font-bold">
          Tạo lô hàng mới
        </h2>
        <div className="py-4 text-justify">
          <div className="flex justify-between my-2">
            <div className="w-1/2 mx-2">
              <label
                htmlFor="batchquantity"
                className="block text-xl text-primary font-bold mb-2"
              >
                Số lượng
              </label>
              <input
                id="batchquantity"
                name="batchquantity"
                type="text"
                placeholder="Số lượng"
                value={productBatch.batchquantity}
                onChange={handleChange}
                className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
              />
              {productBatchError.batchquantity && (
                <p className="text-red-500 mt-1 text-xs italic">
                  {productBatchError.batchquantity}
                </p>
              )}
            </div>
            <div className="w-1/2 mx-2">
              <label
                htmlFor="unitofmeasure"
                className="block text-xl text-primary font-bold mb-2"
              >
                Đơn vị
              </label>
              <input
                id="unitofmeasure"
                name="unitofmeasure"
                type="text"
                placeholder="Đơn vị"
                value={productBatch.unitofmeasure}
                onChange={handleChange}
                className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
              />
              {productBatchError.unitofmeasure && (
                <p className="text-red-500 mt-1 text-xs italic">
                  {productBatchError.unitofmeasure}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-between my-2">
            {/* <div className="w-1/2 mx-2">
              <label
                htmlFor="batchquality"
                className="block text-xl text-primary font-bold mb-2"
              >
                Chất lượng
              </label>
              <select
                name="batchquality"
                id="batchquality"
                value={productBatch.batchquality}
                onChange={handleChange}
                className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
              >
                <option value="">Chọn chất lượng</option>
                <option value="Tươi">Tươi</option>
                <option value="Tương đối tươi">Tương đối tươi</option>
                <option value="Bình thường">Bình thường</option>
                <option value="Sắp hết hạn">Sắp hết hạn</option>
              </select>
              {productBatchError.batchquality && (
                <p className="text-red-500 mt-1 text-xs italic">
                  {productBatchError.batchquality}
                </p>
              )}
            </div> */}
            <div className="w-1/2 mx-2">
              <label
                htmlFor="plantingdate"
                className="block text-xl text-primary font-bold mb-2"
              >
                Ngày trồng
              </label>
              <input
                id="plantingdate"
                name="plantingdate"
                type="date"
                placeholder="Ngày trồng"
                value={productBatch.plantingdate}
                onChange={handleChange}
                className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
              />
              {productBatchError.plantingdate && (
                <p className="text-red-500 mt-1 text-xs italic">
                  {productBatchError.plantingdate}
                </p>
              )}
            </div>
            <div className="w-1/2 mx-2">
              <label
                htmlFor="harvestdate"
                className="block text-xl text-primary font-bold mb-2"
              >
                Ngày thu hoạch
              </label>
              <input
                id="harvestdate"
                name="harvestdate"
                type="date"
                placeholder="Ngày thu hoạch"
                value={productBatch.harvestdate}
                onChange={handleChange}
                className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
              />
              {productBatchError.harvestdate && (
                <p className="text-red-500 mt-1 text-xs italic">
                  {productBatchError.harvestdate}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-between my-2">
            
            <div className="w-1/2 mx-2">
              <label
                htmlFor="expirydate"
                className="block text-xl text-primary font-bold mb-2"
              >
                Ngày hết hạn
              </label>
              <input
                id="expirydate"
                name="expirydate"
                type="date"
                placeholder="Ngày hết hạn"
                value={productBatch.expirydate}
                onChange={handleChange}
                className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
              />
              {productBatchError.expirydate && (
                <p className="text-red-500 mt-1 text-xs italic">
                  {productBatchError.expirydate}
                </p>
              )}
            </div>
            <div className="w-1/2 mx-2">
              <label
                htmlFor="batchprice"
                className="block text-xl text-primary font-bold mb-2"
              >
                Giá
              </label>
              <input
                id="batchprice"
                name="batchprice"
                type="text"
                placeholder="Giá"
                value={productBatch.batchprice}
                onChange={handleChange}
                className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
              />

              {productBatchError.batchprice && (
                <p className="text-red-500 mt-1 text-xs italic">
                  {Number(productBatchError.batchprice).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          {/* <div className="flex justify-between my-2">
            
            <div className="w-1/2 mx-2">
              <label
                htmlFor="promotion"
                className="block text-xl text-primary font-bold mb-2"
              >
                Giảm giá
              </label>
              <input
                id="promotion"
                name="promotion"
                type="text"
                placeholder="Giảm giá"
                value={productBatch.promotion}
                onChange={handleChange}
                className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
              />
              {productBatchError.promotion && (
                <p className="text-red-500 mt-1 text-xs italic">
                  {productBatchError.promotion}
                </p>
              )}
            </div>
          </div> */}
          <div className="flex justify-end mt-5 font-bold">
            <button
              className="bg-red-500 text-secondary px-5 py-2 rounded-lg hover:opacity-75 mx-2"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="bg-primary text-secondary px-5 py-2 rounded-lg hover:opacity-75 mx-2"
              onClick={handleSubmit}
            >
              Tạo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
CreateProductBatch.propTypes = {
  onClose: PropTypes.func,
  producid: PropTypes.string,
};
