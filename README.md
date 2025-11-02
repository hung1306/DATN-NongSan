# ĐATN: Website Thương Mại Điện Tử Buôn Bán và Trao Đổi Nông Sản, Tích Hợp Hệ Thống Gợi Ý

## Người Thực Hiện
- **Lưu Vũ Hà (2013039)**  
- **Nguyễn Phước Đắc Hùng (2013369)**  

## Mô Tả Dự Án
Dự án này nhằm xây dựng một nền tảng thương mại điện tử để hỗ trợ việc buôn bán và trao đổi nông sản trong một khu vực địa lý nhỏ (ví dụ: TP. Hồ Chí Minh).  

**Điểm nổi bật**:    
- Hệ thống gợi ý sử dụng mô hình hybrid kết hợp Collaborative Filtering và Content-Based Filtering để cải thiện trải nghiệm người dùng.  
- Giao diện thân thiện, hỗ trợ quản lý sản phẩm và theo dõi doanh thu dễ dàng.  
- Tích hợp chức năng tìm kiếm bằng hình ảnh, cho phép người dùng tải ảnh lên để tìm sản phẩm tương tự.  

## Công Nghệ Sử Dụng
### Frontend
- **React**: Xây dựng giao diện người dùng.  
- **Vite**: Công cụ bundler nhẹ, tối ưu hóa tốc độ phát triển.  
- **TailwindCSS**: 

### Backend
- **Node.js**: Xử lý logic server-side.  
- **Express**: Framework đơn giản và mạnh mẽ cho API RESTful.  

### Cơ Sở Dữ Liệu
- **PostgreSQL**: Quản lý dữ liệu hiệu quả và ổn định.  

### Hệ Thống Gợi Ý
- **Flask API**: Đảm bảo tính linh hoạt và dễ triển khai.  
- **Hybrid Model**:  
  - **TF-IDF**: Đánh giá mức độ quan trọng của từ khóa trong nội dung sản phẩm.  
  - **SVD (Singular Value Decomposition)**: Dự đoán sở thích người dùng dựa trên tương tác.  

### Tìm Kiếm Bằng Hình Ảnh
- **Vision Tranfomer**: 
- **Image Search API**: Tích hợp API vào backend để xử lý và truy vấn sản phẩm từ cơ sở dữ liệu.

## Cài Đặt và Chạy Dự Án
### 1. Clone Repository
Sao chép mã nguồn từ GitHub:  
```sh
git clone https://github.com/hung1306/DATN-NongSan.git
```  

### 2. Chạy Frontend
```sh
cd front-end
npm install
npm run dev
```  
Mở trình duyệt và truy cập: `http://localhost:5173`.  

### 3. Chạy Backend
```sh
cd back-end
npm install
npm start
```  
API sẽ được khởi chạy tại: `http://localhost:3000`.  

### 4. Chạy Hệ Thống Gợi Ý
```sh
cd python/recommendation-system
pip install -r requirements.txt
python apiNew.py
```  
Flask API sẽ hoạt động tại: `http://localhost:5000`.  

### 5. Chạy Tìm Kiếm Bằng Hình Ảnh
```sh
cd back-end
npm install
npm start
```  
Tải ảnh lên tại giao diện và hệ thống sẽ tìm kiếm sản phẩm tương tự dựa trên đặc trưng hình ảnh.  

## Chức Năng Chính
- **Đăng nhập/Đăng ký**: Hỗ trợ người dùng truy cập với vai trò: nông dân, nhà phân phối, khách hàng.  
- **Quản lý sản phẩm**: Cho phép nông dân thêm mới, chỉnh sửa, và xóa sản phẩm.  
- **Hệ thống gợi ý**:  
  - Gợi ý sản phẩm nổi bật trên trang chủ.  
  - Hiển thị sản phẩm tương tự trên trang chi tiết.  
- **Tìm kiếm bằng hình ảnh**: Giúp người dùng tìm sản phẩm bằng cách tải ảnh lên.  
- **Thanh toán trực tuyến**: Tích hợp cổng thanh toán hiện đại.  

## Cấu Trúc Thư Mục
```plaintext
DATN-NongSan/
├── front-end/        
├── back-end/          
├── python/            
│   └── recommendation-system/ 
└── README.md         
```  

## Liên Hệ
Nếu có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ:  
- **Nguyễn Phước Đắc Hùng**: hung.nguyendachungbk@hcmut.edu.vn  
- **Lưu Vũ Hà**: ha.luu070202@hcmut.edu.vn  

Chân thành cảm ơn! 🙌
