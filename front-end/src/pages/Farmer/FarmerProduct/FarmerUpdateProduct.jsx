import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { PropTypes } from "prop-types";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/config";
import { getCategoryById } from "../../../service/FarmerService/categoryService";
import { getFarmByFarmId } from "../../../service/CustomerService/farmService";
import { toast } from "react-toastify";
import Loading from "../../../components/Loading";

export default function FarmerUpdateProduct({
  onClose,
  product,
  userId,
  refreshProductList,
}) {
  const [productname, setProductName] = useState(product.productname);
  const [categoryid, setCategoryid] = useState(product.categoryid);
  const [farmid, setFarmid] = useState(product.farmid);
  const [productimage1, setProductimage1] = useState(product.productimage1);
  const [productimage2, setProductimage2] = useState(product.productimage2);
  const [productimage3, setProductimage3] = useState(product.productimage3);
  const [overviewdes, setOverviewdes] = useState(product.overviewdes);
  const [storagemethod, setStoragemethod] = useState(product.storagemethod);
  const [healtbenefit, setHealtbenefit] = useState(product.healtbenefit);
  const [cookingmethod, setCookingmethod] = useState(product.cookingmethod);
  const [isdistributorview, setIsdistributorview] = useState(
    product.isdistributorview
  );

  //error state
  const [productnameError, setProductnameError] = useState("");
  const [categoryidError, setCategoryidError] = useState("");
  const [farmidError, setFarmidError] = useState("");
  const [productimage1Error, setProductimage1Error] = useState("");
  const [productimage2Error, setProductimage2Error] = useState("");
  const [productimage3Error, setProductimage3Error] = useState("");
  const [overviewdesError, setOverviewdesError] = useState("");
  const [storagemethodError, setStoragemethodError] = useState("");
  const [healthbenefitError, setHealthbenefitError] = useState("");
  const [cookingmethodError, setCookingmethodError] = useState("");

  const [categories, setCategories] = useState([]);
  const [farms, setFarms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [farmName, setFarmName] = useState("");
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const category = await axios.get(`${API_BASE_URL}/category`);

        let categoriesData = category.data;
        setCategories(categoriesData);
        const farm = await axios.get(`${API_BASE_URL}/farm/user/${userId}`);
        let farmsData = farm.data;
        setFarms(farmsData);

        const categoryRes = await getCategoryById(categoryid);
        let categoryData = categoryRes.categoryname;
        setCategoryName(categoryData);
        const farmRes = await getFarmByFarmId(farmid);
        let farmData = farmRes.farmname;
        setFarmName(farmData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [userId, categoryid, farmid]);

  const validateForm = () => {
    if (productname === "") {
      setProductnameError("Tên sản phẩm không được để trống");
      return false;
    } else {
      setProductnameError("");
    }
    if (categoryid === "") {
      setCategoryidError("Danh mục không được để trống");
      return false;
    } else {
      setCategoryidError("");
    }
    if (farmid === "") {
      setFarmidError("Trang trại không được để trống");
      return false;
    } else {
      setFarmidError("");
    }
    if (productimage1 === "") {
      setProductimage1Error("Hình ảnh không được để trống");
      return false;
    } else {
      setProductimage1Error("");
    }
    if (productimage2 === "") {
      setProductimage2Error("Hình ảnh không được để trống");
      return false;
    } else {
      setProductimage2Error("");
    }
    if (productimage3 === "") {
      setProductimage3Error("Hình ảnh không được để trống");
      return false;
    } else {
      setProductimage3Error("");
    }
    if (overviewdes === "") {
      setOverviewdesError("Mô tả không được để trống");
      return false;
    } else {
      setOverviewdesError("");
    }
    if (storagemethod === "") {
      setStoragemethodError("Phương pháp bảo quản không được để trống");
      return false;
    } else {
      setStoragemethodError("");
    }
    if (healtbenefit === "") {
      setHealthbenefitError("Lợi ích đối với sức khỏe không được để trống");
      return false;
    } else {
      setHealthbenefitError("");
    }
    if (cookingmethod === "") {
      setCookingmethodError("Phương pháp chế biến không được để trống");
      return false;
    } else {
      setCookingmethodError("");
    }
    return true;
  };

  const onUpdateProduct = async (productid) => {
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("productname", productname);
      formData.append("categoryid", categoryid);
      formData.append("farmid", farmid);
      formData.append("productimage1", productimage1);
      formData.append("productimage2", productimage2);
      formData.append("productimage3", productimage3);
      formData.append("overviewdes", overviewdes);
      formData.append("storagemethod", storagemethod);
      formData.append("healtbenefit", healtbenefit);
      formData.append("cookingmethod", cookingmethod);
      formData.append("isdistributorview", isdistributorview);

      const response = await axios.put(
        `${API_BASE_URL}/farmer/update/product/${productid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        onClose();
        toast.success("Cập nhật sản phẩm thành công");
        refreshProductList();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div className="bg-white p-6 rounded w-1/2 m-auto text-primary h-3/4 overflow-auto shadow-xl">
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="flex justify-end">
              <button
                className="text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <h2 className="text-3xl text-center font-bold">
              Cập nhật sản phẩm
            </h2>
            <div className="py-4">
              <div className="flex justify-between my-2">
                <div className="w-full mx-2">
                  <label className="block text-xl text-primary font-bold mb-2">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    placeholder="Tên sản phẩm"
                    value={productname}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
                  />
                  <p className="text-red-500 mt-1 text-xs italic">
                    {productnameError}
                  </p>
                </div>
              </div>

              <div className="flex justify-between my-2">
                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="category"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Danh mục
                  </label>
                  <select
                    id="category"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    onChange={(e) => setCategoryid(e.target.value)}
                  >
                    <option value={categoryid} className="">
                      {categoryName}
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category.categoryid}
                        value={category.categoryid}
                        className="bg-secondary"
                      >
                        {category.categoryname}
                      </option>
                    ))}
                  </select>
                  {categoryidError && (
                    <p className="mt-1 text-red-500">{categoryidError}</p>
                  )}
                </div>

                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="productimage1"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Hình ảnh 1
                  </label>
                  <input
                    type="file"
                    placeholder="Hình ảnh 1"
                    onChange={(e) => setProductimage1(e.target.files[0])}
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
                  />
                  <p className="mt-1 text-red-500 text-xs italic">
                    {productimage1Error}
                  </p>
                </div>
              </div>
              <div className="flex justify-between my-2">
                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="productimage2"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Hình ảnh 2
                  </label>
                  <input
                    type="file"
                    placeholder="Hình ảnh 2"
                    onChange={(e) => setProductimage2(e.target.files[0])}
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
                  />
                  <p className="mt-1 text-red-500 text-xs italic">
                    {productimage2Error}
                  </p>
                </div>
                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="productimage3"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Hình ảnh 3
                  </label>
                  <input
                    type="file"
                    placeholder="Hình ảnh 3"
                    onChange={(e) => setProductimage3(e.target.files[0])}
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
                  />
                  <p className="mt-1 text-red-500 text-xs italic">
                    {productimage3Error}
                  </p>
                </div>
              </div>
              {/* 4 */}

              <div className="flex justify-between my-2">
                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="farm"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Trang trại
                  </label>
                  <select
                    id="farm"
                    className="bg-fourth text-base text-primary p-2 rounded-xl w-full border border-gray-500"
                    onChange={(e) => setFarmid(e.target.value)}
                    disabled
                  >
                    <option value={farmid} className="">
                      {farmName}
                    </option>
                    {Array.isArray(farms) &&
                      farms.map((farm) => (
                        <option
                          key={farm.farmid}
                          value={farm.farmid}
                          className="bg-secondary"
                        >
                          {farm.farmname}
                        </option>
                      ))}
                  </select>
                  {farmidError && (
                    <p className="mt-1 text-red-500">{farmidError}</p>
                  )}
                </div>

                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="isdistributorview"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Hiển thị cho nhà phân phối
                  </label>
                  <select
                    value={isdistributorview}
                    onChange={(e) =>
                      setIsdistributorview(e.target.value === "true")
                    }
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500"
                  >
                    <option value="true">Có</option>
                    <option value="false">Không</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between my-2">
                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="overviewdes"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Mô tả
                  </label>
                  <textarea
                    placeholder="Mô tả"
                    value={overviewdes}
                    onChange={(e) => setOverviewdes(e.target.value)}
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500 h-40"
                  />
                  <p className="mt-1 text-red-500 text-xs italic">
                    {overviewdesError}
                  </p>
                </div>
                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="storagemethod"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Phương pháp bảo quản
                  </label>
                  <textarea
                    placeholder="Phương pháp bảo quản"
                    value={storagemethod}
                    onChange={(e) => setStoragemethod(e.target.value)}
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500 h-40"
                  />
                  <p className="mt-1 text-red-500 text-xs italic">
                    {storagemethodError}
                  </p>
                </div>
              </div>
              {/* 7 */}
              <div className="flex justify-between my-2">
                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="healthbenefit"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Lợi ích đối với sức khỏe
                  </label>
                  <textarea
                    placeholder="Lợi ích đối với sức khỏe"
                    value={healtbenefit}
                    onChange={(e) => setHealtbenefit(e.target.value)}
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500 h-40"
                  />
                  <p className="mt-1 text-red-500 text-xs italic">
                    {healthbenefitError}
                  </p>
                </div>
                <div className="w-1/2 mx-2">
                  <label
                    htmlFor="cookingmethod"
                    className="block text-xl text-primary font-bold mb-2"
                  >
                    Phương pháp chế biến
                  </label>
                  <textarea
                    placeholder="Phương pháp chế biến"
                    value={cookingmethod}
                    onChange={(e) => setCookingmethod(e.target.value)}
                    className="bg-fourth text-base text-primary p-2 rounded-2xl w-full border border-gray-500 h-40"
                  />
                  <p className="mt-1 text-red-500 text-xs italic">
                    {cookingmethodError}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-5">
                <button
                  className="bg-red-600 hover:opacity-90 text-white text-xl font-bold py-2 px-4 rounded-xl w-1/6"
                  onClick={onClose}
                >
                  Hủy
                </button>

                <button
                  className="bg-primary hover:bg-primary-700 text-white text-xl font-bold py-2 px-4 rounded-xl ml-5 w-1/6"
                  onClick={() => {
                    onUpdateProduct(product.productid);
                  }}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

FarmerUpdateProduct.propTypes = {
  onClose: PropTypes.func,
  product: PropTypes.object,
  userId: PropTypes.string,
  refreshProductList: PropTypes.func,
};
