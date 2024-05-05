  // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  // import { faUser, faShoppingCart,faCheckCircle  } from "@fortawesome/free-solid-svg-icons";
  // import { Link } from "react-router-dom";
  import HeaderFarmer from "../../../../components/HeaderFarmer/HeaderFarmer.jsx"
  import '../../../../App.css'
  import {  useState, useRef } from "react";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faBars, faTimes, faArrowLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
  export default function HeaderCustomer() {
      // Hiện thị thanh nav-icon
      const [showNav, setShowNav] = useState(false);
      const [editField, setEditField] = useState(null);
    const navRef = useRef();

    const toggleNav = () => {
        setShowNav(!showNav);
    };

    const closeNav = () => {
        setShowNav(false);
    };

    // useEffect(() => {
    //     const handleOutsideClick = (event) => {
    //         if (navRef.current && !navRef.current.contains(event.target)) {
    //             setShowNav(false);
    //         }
    //     };

    //     document.addEventListener("click", handleOutsideClick);

    //     return () => {
    //         document.removeEventListener("click", handleOutsideClick);
    //     };
    // }, []);

    const handleUpdateProfile = () => {
        // Xử lý cập nhật thông tin cá nhân ở đây
        console.log("Đang cập nhật thông tin cá nhân...");
    };

    const handleEditField = (field) => {
        setEditField(field);
      };
  return (
      <div className="h-screen flex flex-col">
          <HeaderFarmer />
          <div ref={navRef}>
                {/* Icon */}
                <div className="cursor-pointer px-3 py-2 text-2xl" onClick={toggleNav}>
                    {showNav ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faBars} onClick={closeNav} />}
                </div>
                {showNav && (
                    <div className="bg-gray-200 h-screen w-64 fixed left-0 top-0 mt-16  border border-gray-300">
                        <div className="flex items-center px-5 py-3 text-2xl">
                            <FontAwesomeIcon icon={faArrowLeft} onClick={closeNav} className="mr-2 cursor-pointer" />
                            {/* <span className="text-lg">Back</span> */}
                        </div>
                        <ul className="py-4">
                            <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">Thống kê</li>
                            <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">Quản lý vườn</li>
                            <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">Quản lý danh mục</li>
                            <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">Quản lý sản phẩm</li>
                            <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">Quản lý đơn hàng</li>
                            <li className="px-4 py-2 cursor-pointer hover:bg-gray-300 ">Quản lý thanh toán</li>
                            <li className="px-4 py-2 cursor-pointer click:bg-gray-300 bg-primary text-white">Thông tin cá nhân</li>
                        </ul>
                    </div>
                )}
            </div>
            <div className={`flex-grow flex flex-row justify-center items-center ${showNav ? "ml-64" : ""}`}>
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-4xl flex justify-between">
          <div className="w-1/2 pr-4">
            <p className="mb-3">
              Email: example@example.com <FontAwesomeIcon icon={faAngleRight} className="ml-1 text-gray-500 cursor-pointer" onClick={() => handleEditField("email")}/>
            </p>
            <hr className="mb-3" />
            <p className="mb-3">
              Username: example_user <FontAwesomeIcon icon={faAngleRight} className="ml-1 text-gray-500 cursor-pointer" onClick={() => handleEditField("username")}/>
            </p>
            <hr className="mb-3" />
            <p className="mb-3">
              Mật khẩu: ******** <FontAwesomeIcon icon={faAngleRight} className="ml-1 text-gray-500 cursor-pointer" onClick={() => handleEditField("password")}/>
            </p>
            <hr className="mb-3" />
            <p className="mb-3">
              Họ và tên: John Doe <FontAwesomeIcon icon={faAngleRight} className="ml-1 text-gray-500 cursor-pointer" onClick={() => handleEditField("name")}/>
            </p>
            <hr className="mb-3" />
            <p className="mb-3">
              Số điện thoại: 1234567890 <FontAwesomeIcon icon={faAngleRight} className="ml-1 text-gray-500 cursor-pointer" onClick={() => handleEditField("phone")}/>
            </p>
            <hr className="mb-3" />
            <p className="mb-3">
              Địa chỉ: 123 Street, City, Country <FontAwesomeIcon icon={faAngleRight} className="ml-1 text-gray-500 cursor-pointer" onClick={() => handleEditField("address")}/>
            </p>
            <hr className="mb-3" />
            <div className="flex justify-end w-full">
              <button className="bg-primary text-white py-2 px-4 rounded-md mb-4" onClick={handleUpdateProfile}>
                Cập nhật thông tin
              </button>
            </div>
          </div>
          <div className="w-1/2 pl-4 border-l border-gray-300">
            <div className="flex flex-col items-center">
              <img src="/src/assets/avata_img/avata.png" alt="Avatar" className="w-40 h-40 rounded-full mb-4" />
              <button className="bg-primary text-white py-2 px-4 rounded-md">Thay đổi avatar</button>
            </div>
          </div>
        </div>
            </div>
      </div>
  );
  }
