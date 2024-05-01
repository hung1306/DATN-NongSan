import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function HeaderFarmer() {
  return (
    <header className="p-3 bg-primary text-white px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
      <nav className="flex flex-col sm:flex-row justify-between items-center w-4/5 m-auto">
        <section className="flex space-x-2 sm:space-x-4 items-center">
          <Link to="/" className="font-bold text-2xl sm:text-4xl mx-2 sm:mx-5">
            AgriMart
          </Link>
          <p className="cursor-pointer mx-1 sm:mx-2">Trở thành nhà cung cấp</p>
        </section>
        <section className="flex space-x-2 sm:space-x-4 mt-2 sm:mt-4">
          <div className="flex items-center space-x-1 sm:space-x-2 cursor-pointer mx-1 sm:mx-2">
            <FontAwesomeIcon icon={faBell} />
            <p>Thông báo</p>
          </div>
          <div className="flex space-x-1 sm:space-x-2">
            <p className="cursor-pointer mx-1 sm:mx-2">Đăng nhập</p>
            <p className="cursor-pointer mx-1 sm:mx-2">Đăng ký</p>
          </div>
        </section>
      </nav>
    </header>
  );
}
