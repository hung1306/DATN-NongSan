
const policies = [
  {
    title: "Chính sách vận chuyển",
    description:
      "Đảm bảo giao hàng nhanh chóng nhất kể từ khi đặt hàng, áp dụng cho khu vực TP. Hồ Chí Minh.",
    icon: "1",
    color: "bg-fourth",
  },
  {
    title: "Chính sách đổi trả",
    description:
      "Đổi trả sản phẩm miễn phí nếu sản phẩm bị hư hỏng hoặc chất lượng không đạt yêu cầu.",
    icon: "2",
    color: "bg-fourth",
  },
  {
    title: "Chất lượng đảm bảo",
    description:
      "Sản phẩm đạt tiêu chuẩn chất lượng, được kiểm định trước khi giao hàng.",
    icon: "3",
    color: "bg-fourth",
  },
];

function PolicyShow() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg shadow-2xl mb-5">
      <h2 className="text-3xl font-bold text-primary mb-8 text-center">
        Chính sách của chúng tôi
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {policies.map((policy, index) => (
          <div
            key={index}
            className={`relative flex flex-col items-center text-center p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${policy.color} shadow-xl`}
          >
            <div
              className="absolute -top-6 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-md"
              style={{ boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)" }}
            >
              <p className="text-2xl font-bold">{policy.icon}</p>
            </div>
            <h3 className="text-2xl font-bold text-primary mt-10 mb-4">
              {policy.title}
            </h3>
            <p className="text-primary">{policy.description}</p>
            {/* <div className="absolute bottom-4 w-full flex justify-center">
              <button className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition duration-300">
                Tìm hiểu thêm
              </button>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PolicyShow;
