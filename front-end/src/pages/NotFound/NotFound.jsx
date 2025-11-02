import { Link, useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-3xl w-full text-center space-y-6">
        <div className="mx-auto w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20 text-primary"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
          >
            <circle
              cx="28"
              cy="28"
              r="16"
              strokeWidth="2"
              className="text-primary/90"
            />
            <path d="M41 41l6 6" strokeWidth="3" strokeLinecap="round" />
            <path
              d="M20 24c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8-8-3.582-8-8z"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <h1 className="text-6xl sm:text-7xl font-extrabold text-gray-900">
          404
        </h1>

        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Trang không tìm thấy
          </h2>
          <p className="mt-2 text-gray-500 max-w-xl mx-auto">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi đường dẫn hoặc tạm
            thời không khả dụng.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-white font-medium shadow-md hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Về trang chủ
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-6 py-3 bg-white text-gray-700 hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="search" className="sr-only">
            Tìm kiếm
          </label>
          <input
            id="search"
            placeholder="Tìm sản phẩm, danh mục hoặc trang..."
            className="w-full max-w-md mx-auto rounded-md border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <p className="mt-4 text-sm text-gray-400">
          Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ bộ phận hỗ trợ.
        </p>
      </div>
    </div>
  );
}

export default NotFound;
