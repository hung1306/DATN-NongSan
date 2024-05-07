-- Tạo extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo bảng Admin
CREATE TABLE Admin (
    AdminId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Email VARCHAR(255) NOT NULL UNIQUE,
    UserName VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Fullname VARCHAR(100) NOT NULL
);

-- Chèn dữ liệu cơ bản cho bảng Admin
INSERT INTO Admin (Email, UserName, Password, Fullname)
VALUES 
    ('admin1@example.com', 'admin1', 'hashedpassword1', 'Admin 1'),
    ('admin2@example.com', 'admin2', 'hashedpassword2', 'Admin 2');

-- Tạo bảng User
-- Hà thêm AddressFarmer, Dob
CREATE TABLE "User" (
    UserId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    UserName VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Fullname VARCHAR(100) NOT NULL,
    Street VARCHAR(255),
    Commune VARCHAR(255),
    District VARCHAR(255),
    Province VARCHAR(255),
    PhoneNumber VARCHAR(15),
    IndentityCard VARCHAR(255), 
    Address VARCHAR(255), 
    Dob DATE,
    Status BOOLEAN,
    Role VARCHAR(20),
    Avatar TEXT
);

-- Chèn dữ liệu cơ bản cho bảng User
INSERT INTO "User" (UserName, Email, Password, Fullname, Street, Commune, District, Province, PhoneNumber, IndentityCard, AddressFarmer, Dob, Status, Role, Avatar)
VALUES 
    ('user1', 'user1@example.com', 'hashedpassword1', 'User 1', '123 Street A', 'Commune A', 'District A', 'Province A', '123456789', 'ID123456789','Address1', 'MM-DD-YY', TRUE, 'customer', 'avatar1.jpg'),
    ('user2', 'user2@example.com', 'hashedpassword2', 'User 2', '456 Street B', 'Commune B', 'District B', 'Province B', '987654321', 'ID987654321', 'Address2', 'MM-DD-YY', TRUE, 'farmer', 'avatar2.jpg');

-- Tạo bảng Farm
-- Hà thêm ContactName,IdentityCard, FarmArea->FarmScale
    CREATE TABLE Farm (
        FarmId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        UserId UUID,
        FarmName VARCHAR(100) NOT NULL,
        ContactName VARCHAR(100) NOT NULL,
        IdentityCard VARCHAR(255)
        FarmStreet VARCHAR(255),
        FarmCommune VARCHAR(255),
        FarmDistrict VARCHAR(255),
        FarmProvince VARCHAR(255),
        FarmDes TEXT,
        FarmAddress TEXT,
        FarmScale VARCHAR(255),
        FarmType VARCHAR(255)
    );

-- Chèn dữ liệu cơ bản cho bảng Farm
INSERT INTO Farm (UserId, FarmName, ContactName, IdentityCard, FarmStreet, FarmCommune, FarmDistrict, FarmProvince, FarmDes, FarmAddress, FarmScale, FarmType)
VALUES 
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', 'Farm 1', 'Nguyen Van A', 'XXX XXX XXX', '123 Farm Street', 'Farm Commune', 'Farm District', 'Farm Province', 'Description for Farm 1', 'Farm Address 1', 100.5, 'Type 1'),
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', 'Farm 2', 'Nguyen Van B', 'YYY YYY YYY', '456 Farm Street', 'Farm Commune', 'Farm District', 'Farm Province', 'Description for Farm 2', 'Farm Address 2', 75.3, 'Type 2');

-- Tạo bảng Crop
CREATE TABLE Crop (
    FarmId UUID,
    ProductId UUID,
    CropName VARCHAR(100) NOT NULL,
    CropDes TEXT,
    PlantArea NUMERIC,
    HarvestDate DATE,
    EstimatedYield NUMERIC,
    CropStatus VARCHAR(20),
    PlantDate DATE
);

-- Chèn dữ liệu cơ bản cho bảng Crop
INSERT INTO Crop (FarmId, ProductId, CropName, CropDes, PlantArea, HarvestDate, EstimatedYield, CropStatus, PlantDate)
VALUES 
    ('82b0e721-8405-43e2-8f53-80f39414a81b', 'd1220d94-9d13-49c0-9f75-7bcf57051b7d', 'Crop 1', 'Description for Crop 1', 50.2, '2024-04-09', 500, 'Growing', '2024-01-01'),
    ('54d334b4-0c8a-4d36-b43d-9dbdab4bf5c5', 'cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', 'Crop 2', 'Description for Crop 2', 25.5, '2024-04-09', 300, 'Harvested', '2023-12-01');

-- Tạo bảng Category
CREATE TABLE Category (
    CategoryId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    UserId UUID,
    CategoryName VARCHAR(100) NOT NULL,
    CategoryImage TEXT,
    CategoryDes TEXT
);

-- Chèn dữ liệu cơ bản cho bảng Category
INSERT INTO Category (UserId, CategoryName, CategoryImage, CategoryDes)
VALUES 
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', 'Category 1', 'category1.jpg', 'Description for Category 1'),
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', 'Category 2', 'category2.jpg', 'Description for Category 2');

-- Tạo bảng Product
CREATE TABLE Product (
    ProductId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    FarmerId UUID,
    CategoryId UUID,
    ProductName VARCHAR(100) NOT NULL,
    ProductImage1 TEXT,
    ProductImage2 TEXT,
    ProductImage3 TEXT,
    HealtBenefit TEXT,
    StorageMethod TEXT,
    CookingMethod TEXT,
    OverviewDes TEXT,
    ProductPrice NUMERIC,
    ProductQuantity INTEGER,
    ExpiryDate DATE
);

-- Chèn dữ liệu cơ bản cho bảng Product
INSERT INTO Product (FarmerId, CategoryId, ProductName, ProductImage1, ProductImage2, ProductImage3, HealtBenefit, StorageMethod, CookingMethod, OverviewDes, ProductPrice, ProductQuantity, ExpiryDate)
VALUES 
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', '49f26d8c-5b43-4a8a-aba4-fe73fd7b6d51', 'Bí Đỏ', 'bido1.jpg', 'bido2.jpg', 'bido3.jpg', 'Bí đỏ giàu chất xơ và chất dinh dưỡng như vitamin A, C, và khoáng chất như kali và magiê. Chúng cũng chứa các hợp chất chống oxi hóa có thể giúp làm giảm nguy cơ mắc các bệnh tim mạch và ung thư.', 'Bí đỏ có thể được bảo quản ở nhiệt độ phòng trong thời gian ngắn. Để lâu dài hơn, bạn có thể lưu trữ chúng trong tủ lạnh.', 'Bí đỏ có thể được nấu chín, nướng, hấp hoặc thậm chí làm thành nước ép.', 'Bí đỏ là loại rau củ giàu chất dinh dưỡng, thích hợp cho các món salad và món nước ép.', 10.5, 100, '2024-12-31'),
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', '49f26d8c-5b43-4a8a-aba4-fe73fd7b6d51', 'Khoai Tây', 'khoaitay1.jpg', 'khoaitay2.jpg', 'khoaitay3.jpg', 'Khoai tây là một nguồn cung cấp carbohydrate tốt, chứa ít chất béo và có thể giúp tăng cường sự no lâu. Chúng cũng giàu vitamin B6, kali và chất xơ.', 'Khoai tây nên được bảo quản ở nơi thoáng mát, khô ráo và không tiếp xúc trực tiếp với ánh sáng mặt trời.', 'Khoai tây có thể được nấu, rang, hấp, hoặc làm món nướng, xào.', 'Khoai tây là nguyên liệu chính trong các món ăn như khoai tây chiên, khoai tây nướng và món nước hấp.', 8.75, 150, '2024-11-30'),
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', '49f26d8c-5b43-4a8a-aba4-fe73fd7b6d51', 'Khoai Lang', 'khoailang1.jpg', 'khoailang2.jpg', 'khoailang3.jpg', 'Khoai lang là một nguồn cung cấp carbohydrate phong phú, giàu vitamin A, C, và E, cũng như chứa chất chống oxi hóa.', 'Khoai lang nên được bảo quản ở nơi khô ráo, thoáng mát, và không tiếp xúc với ánh sáng mặt trời.', 'Khoai lang có thể được nấu, hấp, nướng, hoặc làm thành món tráng miệng.', 'Khoai lang thích hợp cho các món ăn nấu chín như khoai lang nướng, khoai lang hấp và món ăn nhanh.', 9.2, 120, '2024-12-15'),
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', '49f26d8c-5b43-4a8a-aba4-fe73fd7b6d51', 'Cải Bó Xôi', 'caiboxoi1.jpg', 'caiboxoi2.jpg', 'caiboxoi3.jpg', 'Cải bó xôi giàu chất xơ, vitamin K, A, và C, cũng như chứa các chất chống oxi hóa có thể giúp bảo vệ cơ thể khỏi tổn thương gây ra bởi các gốc tự do.', 'Cải bó xôi nên được bảo quản trong tủ lạnh để giữ tươi lâu hơn.', 'Cải bó xôi có thể được nấu, xào, hấp, hoặc dùng trong các món nấu súp.', 'Cải bó xôi là một nguyên liệu phổ biến trong các món ăn như súp cải, salad và món xào.', 6.5, 80, '2024-12-10'),
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', '49f26d8c-5b43-4a8a-aba4-fe73fd7b6d51', 'Dưa Chuột', 'duachuot1.jpg', 'duachuot2.jpg', 'duachuot3.jpg', 'Dưa chuột chứa nước nhiều và rất ít calo, cũng như là một nguồn cung cấp vitamin và khoáng chất như kali và magiê.', 'Dưa chuột nên được bảo quản trong tủ lạnh để giữ cho chúng tươi ngon và giảm sự mất nước.', 'Dưa chuột thường được ăn sống, hoặc có thể được sử dụng trong các món salad hoặc món mặn.', 'Dưa chuột là một lựa chọn tuyệt vời cho các món salad và món ăn nhẹ.', 4.0, 200, '2024-11-25'),
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', '49f26d8c-5b43-4a8a-aba4-fe73fd7b6d51', 'Bí Xanh', 'bixanh1.jpg', 'bixanh2.jpg', 'bixanh3.jpg', 'Bí xanh là một nguồn cung cấp beta-carotene, chất xơ, và kali. Chúng cũng chứa một lượng ít calo.', 'Bí xanh có thể được bảo quản trong điều kiện khô ráo và thoáng mát trong thời gian dài.', 'Bí xanh thường được nấu chín, nướng, hoặc dùng trong các món nước như súp.', 'Bí xanh thích hợp cho các món ăn như súp bí đỏ, món nướng bí đỏ và salad bí đỏ.', 7.0, 90, '2024-11-20');


-- Tạo bảng Cart
CREATE TABLE Cart (
    CartId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    UserId UUID,
    ProductId UUID,
    QuantityOfCart INTEGER
);

-- Chèn dữ liệu cơ bản cho bảng Cart
INSERT INTO Cart (UserId, ProductId, QuantityOfCart)
VALUES 
    ('d1220d94-9d13-49c0-9f75-7bcf57051b7d', 'ee9c5d95-f5c9-4875-88c3-464ecfb8e393', 2),
    ('d1220d94-9d13-49c0-9f75-7bcf57051b7d', '5f15b744-c04d-4b78-8e35-38b5fb0c8a0e', 1);

-- Tạo bảng Order
CREATE TABLE "Order" (
    OrderId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    TotalAmount NUMERIC,
    EstimateDelivery DATE,
    ShippingAddress TEXT,
    OrderStatus VARCHAR(20),
    OrderTime TIMESTAMP,
    UserId UUID
);

-- Chèn dữ liệu cơ bản cho bảng Order
INSERT INTO "Order" (TotalAmount, EstimateDelivery, ShippingAddress, OrderStatus, OrderTime, UserId)
VALUES 
    (25.5, '2024-04-15', '123 Shipping Street', 'Processing', CURRENT_TIMESTAMP, 'd1220d94-9d13-49c0-9f75-7bcf57051b7d'),
    (35.75, '2024-04-20', '456 Shipping Street', 'Processing', CURRENT_TIMESTAMP, 'd1220d94-9d13-49c0-9f75-7bcf57051b7d');

-- Tạo bảng OrderItem
CREATE TABLE OrderItem (
    OrderId UUID,
    ProductId UUID,
    QuantityOfItem INTEGER
);

-- Chèn dữ liệu cơ bản cho bảng OrderItem
INSERT INTO OrderItem (OrderId, ProductId, QuantityOfItem)
VALUES 
    ('1313c4ee-b8ee-4a3e-9d09-089f110f2f47', 'ee9c5d95-f5c9-4875-88c3-464ecfb8e393', 2),
    ('1313c4ee-b8ee-4a3e-9d09-089f110f2f47', '5f15b744-c04d-4b78-8e35-38b5fb0c8a0e', 1);

-- Tạo bảng Payment
CREATE TABLE Payment (
    PaymentId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    OrderId UUID,
    UserId UUID,
    PaymentMethod VARCHAR(50),
    TransactionID VARCHAR(100),
    Amount NUMERIC,
    PaymentTime TIMESTAMP,
    PaymentStatus VARCHAR(20)
);

-- Chèn dữ liệu cơ bản cho bảng Payment
INSERT INTO Payment (OrderId, UserId, PaymentMethod, TransactionID, Amount, PaymentTime, PaymentStatus)
VALUES 
    ('1313c4ee-b8ee-4a3e-9d09-089f110f2f47', 'd1220d94-9d13-49c0-9f75-7bcf57051b7d', 'Credit Card', '1234567890', 25.5, CURRENT_TIMESTAMP, 'Success'),
    ('1313c4ee-b8ee-4a3e-9d09-089f110f2f47', 'd1220d94-9d13-49c0-9f75-7bcf57051b7d', 'Bank Transfer', '0987654321', 35.75, CURRENT_TIMESTAMP, 'Success');

-- Tạo bảng Review
CREATE TABLE Review (
    ReviewID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ProductID UUID,
    UserID UUID,
    Rating INTEGER,
    Comment TEXT,
    ReviewTime TIMESTAMP
);

-- Chèn dữ liệu cơ bản cho bảng Review
INSERT INTO Review (ProductID, UserID, Rating, Comment, ReviewTime)
VALUES 
    ('ee9c5d95-f5c9-4875-88c3-464ecfb8e393', 'd1220d94-9d13-49c0-9f75-7bcf57051b7d', 4, 'Great product!', CURRENT_TIMESTAMP),
    ('5f15b744-c04d-4b78-8e35-38b5fb0c8a0e', 'd1220d94-9d13-49c0-9f75-7bcf57051b7d', 5, 'Excellent service!', CURRENT_TIMESTAMP);

-- Tạo bảng PurchasesHistory
CREATE TABLE PurchasesHistory (
    PurchaseHistoryId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    OrderId UUID,
    UserId UUID,
    ProductId UUID,
    PaymentId UUID,
    QuantityPurchased INTEGER,
    PurchaseDate TIMESTAMP,
    TotalAmount NUMERIC
);

-- Chèn dữ liệu cơ bản cho bảng PurchasesHistory
INSERT INTO PurchasesHistory (OrderId, UserId, ProductId, PaymentId, QuantityPurchased, PurchaseDate, TotalAmount)
VALUES 
    ('1313c4ee-b8ee-4a3e-9d09-089f110f2f47', 'd1220d94-9d13-49c0-9f75-7bcf57051b7d', 'ee9c5d95-f5c9-4875-88c3-464ecfb8e393', 'eaf79938-b98a-4e3d-840d-10870c8fe0b5', 2, CURRENT_TIMESTAMP, 25.5),
    ('1313c4ee-b8ee-4a3e-9d09-089f110f2f47', 'd1220d94-9d13-49c0-9f75-7bcf57051b7d', '5f15b744-c04d-4b78-8e35-38b5fb0c8a0e', 'eaf79938-b98a-4e3d-840d-10870c8fe0b5', 1, CURRENT_TIMESTAMP, 35.75);

-- Tạo bảng Message
CREATE TABLE Message (
    MessageID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    SenderID UUID,
    ReceiverID UUID,
    Content TEXT,
    Date TIMESTAMP,
    Status BOOLEAN
);

-- Chèn dữ liệu cơ bản cho bảng Message
INSERT INTO Message (SenderID, ReceiverID, Content, Date, Status)
VALUES 
    ('d1220d94-9d13-49c0-9f75-7bcf57051b7d', 'cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', 'Hello, how are you?', CURRENT_TIMESTAMP, FALSE),
    ('cf6bda3c-8f22-4594-bdd8-8dc75b0ebd3d', 'd1220d94-9d13-49c0-9f75-7bcf57051b7d', 'I am good, thank you!', CURRENT_TIMESTAMP, TRUE);

select * from "User" 