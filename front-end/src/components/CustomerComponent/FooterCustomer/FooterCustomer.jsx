import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function FooterCustomer() {
  return (
    <footer className="bg-primary text-secondary p-6 w-full">
      <div className="flex flex-wrap w-7/12 justify-center m-auto text-lg">
        <div className="w-full sm:w-1/2 lg:w-1/3 p-2">
          <h3 className="font-medium">THÔNG TIN LIÊN LẠC</h3>
          <p>Email: agricuturehungha@gmail.com</p>
          <p>Hotline: 0123456789</p>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 p-2">
          <h3 className="font-medium">DỊCH VỤ KHÁCH HÀNG</h3>
          <p>Hướng Dẫn Mua Hàng</p>
          <p>Giao & Nhận Hàng</p>
          <p>Chính Sách Bán Hàng</p>
          <p>Trở Thành Nhà Cung Cấp?</p>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/6 p-2">
          <h3 className="font-medium">CÔNG TY</h3>
          <p>Giới thiệu</p>
          <p>Khách hàng</p>
          <p>Đối tác</p>
          <p>Liên hệ</p>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/6 p-2">
          <h3 className="font-medium">KẾT NỐI</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" aria-label="Facebook" className="hover:text-white cursor-pointer">
              <FaFacebook size={24} />
            </a>
            <a href="https://instagram.com" aria-label="Instagram" className="hover:text-white cursor-pointer">
              <FaInstagram size={24} />
            </a>
            <a href="https://twitter.com" aria-label="Twitter" className="hover:text-white cursor-pointer">
              <FaTwitter size={24} />
            </a>
            <a href="https://youtube.com" aria-label="Youtube" className="hover:text-white cursor-pointer">
              <FaYoutube size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="text-center text-lg mt-5">
        <p>Person in charge of information management: Lưu Vũ Hà & Nguyễn Phước Đắc Hùng</p>
        <p className="font-medium">© 2024 AgriMart. All rights reserved.</p>
      </div>
    </footer>
  );
}