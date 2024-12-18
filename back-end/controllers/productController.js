const pool = require("../config/dbConnect");
const { storage } = require("../config/firebase");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const notificationUtils = require("../utils/notificationsUtils");
// Cấu hình Multer để xử lý upload
const upload = multer({
  storage: multer.memoryStorage(),
});
exports.upload = upload;
// Lấy tất cả sản phẩm
exports.getProducts = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*, 
        f.farmname, 
        f.farmprovince 
      FROM 
        product p
      JOIN 
        farm f 
      ON 
        p.farmid = f.farmid
      WHERE 
        p.isvisibleweb = true
    `;
    const productsWithFarm = await pool.query(query);
    res.json(productsWithFarm.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy sản phẩm có trong category theo id
exports.getProductsByCategoryId = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        p.*, 
        f.farmname, 
        f.farmprovince, 
        c.categoryname,
        pb.*
      FROM 
        product p
      LEFT JOIN 
        farm f 
      ON 
        p.farmid = f.farmid
      LEFT JOIN 
        category c 
      ON 
        p.categoryid = c.categoryid
      LEFT JOIN (
        SELECT DISTINCT ON (productid) *
        FROM product_batch
        ORDER BY productid, batchid
      ) pb
      ON 
        p.productid = pb.productid
      WHERE 
        p.categoryid = $1 AND p.isvisibleweb = true
    `;
    const productsWithFarm = await pool.query(query, [id]);

    // Lấy danh sách id sản phẩm
    const productIds = productsWithFarm.rows.map((item) => item.productid);

    // Kiểm tra nếu danh sách ID sản phẩm trống
    if (productIds.length === 0) {
      return res.status(200).json([]);
    }

    // Lấy điểm đánh giá trung bình cho mỗi sản phẩm
    const reviewQuery = `
      SELECT 
        productid, 
        AVG(rating) as average_rating
      FROM 
        review
      WHERE 
        productid IN (${productIds.map((id) => `'${id}'`).join(",")})
      GROUP BY 
        productid
    `;
    const reviewResults = await pool.query(reviewQuery);
    const reviewMap = reviewResults.rows.reduce((acc, row) => {
      acc[row.productid] = parseFloat(row.average_rating).toFixed(1);
      return acc;
    }, {});

    // Kết hợp điểm đánh giá trung bình với danh sách sản phẩm
    const productsWithRatings = productsWithFarm.rows.map((product) => ({
      ...product,
      average_rating: reviewMap[product.productid] || 0,
    }));

    // Trả về kết quả
    res.status(200).json(productsWithRatings);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy sản phẩm theo id
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  // Validate that the id is a valid UUID
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const query = `
      SELECT 
        p.*, 
        c.categoryname, 
        f.farmname, 
        f.farmprovince 
      FROM 
        product p
      JOIN 
        category c 
      ON 
        p.categoryid = c.categoryid
      JOIN 
        farm f 
      ON 
        p.farmid = f.farmid
      WHERE 
        p.productid = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Tìm kiếm sản phẩm
exports.searchProduct = async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    // Validate that the search input is a valid string
    if (typeof search !== "string") {
      return res.status(400).json({ message: "Invalid search query" });
    }

    const query = `
      SELECT 
        p.*, 
        f.farmname, 
        f.farmprovince,
        c.categoryname,
        pb.*
      FROM 
        product p
      JOIN 
        farm f 
      ON 
        p.farmid = f.farmid
      JOIN
        category c
      ON
        p.categoryid = c.categoryid
      LEFT JOIN (
        SELECT DISTINCT ON (productid) *
        FROM product_batch
        ORDER BY productid, batchid DESC
      ) pb
      ON 
        p.productid = pb.productid
      WHERE 
        (p.productname ILIKE $1 OR c.categoryname ILIKE $1 OR f.farmprovince ILIKE $1 OR f.farmname ILIKE $1)  
        AND p.isvisibleweb = true
    `;
    const productsWithFarm = await pool.query(query, [`%${search}%`]);

    // Lấy danh sách id sản phẩm
    const productIds = productsWithFarm.rows.map((item) => item.productid);

    // Kiểm tra nếu danh sách ID sản phẩm trống
    if (productIds.length === 0) {
      return res.status(200).json([]);
    }

    // Lấy điểm đánh giá trung bình cho mỗi sản phẩm
    const reviewQuery = `
      SELECT 
        productid, 
        AVG(rating) as average_rating
      FROM 
        review
      WHERE 
        productid IN (${productIds.map((id) => `'${id}'`).join(",")})
      GROUP BY 
        productid
    `;
    const reviewResults = await pool.query(reviewQuery);
    const reviewMap = reviewResults.rows.reduce((acc, row) => {
      acc[row.productid] = parseFloat(row.average_rating).toFixed(1);
      return acc;
    }, {});

    // Kết hợp điểm đánh giá trung bình với danh sách sản phẩm
    const productsWithRatings = productsWithFarm.rows.map((product) => ({
      ...product,
      average_rating: reviewMap[product.productid] || 0,
    }));

    // Trả về kết quả
    res.status(200).json(productsWithRatings);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy tất cả sản phẩm theo farmid mà chỉ có productid
exports.getProductsByProductId = async (req, res) => {
  const { productid } = req.params;
  try {
    const farmQuery = await pool.query(
      "SELECT farmid FROM product WHERE productid = $1",
      [productid]
    );

    if (farmQuery.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const farmid = farmQuery.rows[0].farmid;

    const products = await pool.query(
      "SELECT * FROM product WHERE farmid = $1",
      [farmid]
    );

    if (products.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this farm ID" });
    }

    res.json(products.rows);
  } catch (error) {
    console.error("Error fetching products by product ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy tất cả sản phẩm theo farmid
exports.getProductsByFarmId = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        p.*, 
        f.farmname, 
        f.farmprovince,
        pb.*
      FROM 
        product p
      JOIN 
        farm f 
      ON 
        p.farmid = f.farmid
      LEFT JOIN (
        SELECT DISTINCT ON (productid) *
        FROM product_batch
        ORDER BY productid, batchid
      ) pb
      ON 
        p.productid = pb.productid
      WHERE 
        p.farmid = $1 AND p.isvisibleweb = true
    `;
    const productsWithFarm = await pool.query(query, [id]);

    // Lấy danh sách id sản phẩm
    const productIds = productsWithFarm.rows.map((item) => item.productid);

    // Kiểm tra nếu danh sách ID sản phẩm trống
    if (productIds.length === 0) {
      return res
        .status(409)
        .json({ message: "No products found for this farm ID" });
    }

    // Lấy điểm đánh giá trung bình cho mỗi sản phẩm
    const reviewQuery = `
      SELECT 
        productid, 
        AVG(rating) as average_rating
      FROM 
        review
      WHERE 
        productid IN (${productIds.map((id) => `'${id}'`).join(",")})
      GROUP BY 
        productid
    `;
    const reviewResults = await pool.query(reviewQuery);
    const reviewMap = reviewResults.rows.reduce((acc, row) => {
      acc[row.productid] = parseFloat(row.average_rating).toFixed(1);
      return acc;
    }, {});

    // Kết hợp điểm đánh giá trung bình với danh sách sản phẩm
    const productsWithRatings = productsWithFarm.rows.map((product) => ({
      ...product,
      average_rating: reviewMap[product.productid] || 0,
    }));

    // Trả về kết quả
    res.status(200).json(productsWithRatings);
  } catch (error) {
    console.error("Error fetching products by farm ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// farmer controller

// Lấy tất cả sản phẩm theo farmid
exports.getAllProductsByFarmId = async (req, res) => {
  const { userid } = req.params;
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize, 10);

  try {
    // Lấy tổng số sản phẩm theo userid
    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM product p
        JOIN farm f ON p.farmid = f.farmid
        WHERE f.userid = $1`,
      [userid]
    );
    const totalProducts = parseInt(totalResult.rows[0].count, 10);

    // Lấy sản phẩm theo userid với phân trang
    const result = await pool.query(
      `SELECT p.*, c.categoryname, f.farmname 
        FROM product p
        JOIN farm f ON p.farmid = f.farmid
        JOIN category c ON p.categoryid = c.categoryid
        WHERE f.userid = $1
        LIMIT $2 OFFSET $3`,
      [userid, limit, offset]
    );

    // Nếu không có sản phẩm nào thì trả về thông báo
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm nào" });
    }

    // Trả về danh sách sản phẩm cùng với thông tin phân trang
    res.json({
      products: result.rows,
      pagination: {
        totalProducts,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products by farm ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  const {
    productname,
    categoryid,
    farmid,
    overviewdes,
    healtbenefit,
    cookingmethod,
    storagemethod,
    isdistributorview,
  } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (
    !productname ||
    !categoryid ||
    !farmid ||
    !overviewdes ||
    !healtbenefit ||
    !cookingmethod ||
    !storagemethod ||
    isdistributorview === undefined
  ) {
    return res.status(400).json({ message: "Các trường không được để trống" });
  }

  try {
    // Hàm tải ảnh lên Firebase
    const uploadImage = async (image) => {
      if (!image) return null;
      const imageFileName = `products/${productname}/${uuidv4()}`;
      const imageRef = ref(storage, imageFileName);
      await uploadBytes(imageRef, image.buffer, {
        contentType: image.mimetype,
      });
      return await getDownloadURL(imageRef);
    };

    // Upload tất cả ảnh cùng lúc
    const [productImage1Url, productImage2Url, productImage3Url] =
      await Promise.all([
        uploadImage(
          req.files.productimage1 ? req.files.productimage1[0] : null
        ),
        uploadImage(
          req.files.productimage2 ? req.files.productimage2[0] : null
        ),
        uploadImage(
          req.files.productimage3 ? req.files.productimage3[0] : null
        ),
      ]);

    // Tạo sản phẩm mới trong cơ sở dữ liệu
    const newProduct = await pool.query(
      `INSERT INTO product 
      (productname, productimage1, productimage2, productimage3, categoryid, farmid, overviewdes, healtbenefit, cookingmethod, storagemethod, isdistributorview, isvisibleweb) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        productname,
        productImage1Url,
        productImage2Url,
        productImage3Url,
        categoryid,
        farmid,
        overviewdes,
        healtbenefit,
        cookingmethod,
        storagemethod,
        isdistributorview,
        false,
      ]
    );

    // Truy vấn lấy thông tin nông trại và distributor
    const [farmQuery, distributorQuery] = await Promise.all([
      pool.query(`SELECT farmname FROM farm WHERE farmid = $1`, [farmid]),
      pool.query(`SELECT distributorid FROM distributor`),
    ]);

    const farmInfo = farmQuery.rows[0];
    const distributorIds = distributorQuery.rows.map(
      (row) => row.distributorid
    );

    // Gửi thông báo cho các nhà phân phối
    const userRole = "Distributor";
    const title = "Đăng sản phẩm mới";
    const message = `Nông dân trang trại ${farmInfo.farmname} đã đăng sản phẩm mới`;
    const notificationtype = "CreateNewProduct";

    // Gửi thông báo cho tất cả các distributor đầu tiên
    await notificationUtils.createNotification(
      distributorIds[0],
      userRole,
      title,
      message,
      notificationtype
    );

    // Trả về thông tin sản phẩm vừa tạo
    res.json({
      product: newProduct.rows[0],
      message: "Tạo sản phẩm thành công",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Sửa thông tin sản phẩm
exports.updateProduct = async (req, res) => {
  const { productid } = req.params;
  const {
    productname,
    categoryid,
    farmid,
    overviewdes,
    healtbenefit,
    cookingmethod,
    storagemethod,
    isdistributorview,
  } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (
    !productname ||
    !categoryid ||
    !farmid ||
    !overviewdes ||
    !healtbenefit ||
    !cookingmethod ||
    !storagemethod ||
    !isdistributorview
  ) {
    return res.status(400).json({ message: "Các trường ko được để trống" });
  }
  const productImages = req.files;

  try {
    // Kiểm tra sản phẩm có tồn tại không
    const productQuery = await pool.query(
      "SELECT * FROM product WHERE productid = $1",
      [productid]
    );
    if (productQuery.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
    }
    const existingProduct = productQuery.rows[0];
    // Upload images to Firebase
    const uploadImage = async (image) => {
      if (!image) return null;
      const imageBuffer = image.buffer;
      const imageFileName = `products/${
        existingProduct.productname
      }/${uuidv4()}`;
      const imageRef = ref(storage, imageFileName);

      await uploadBytes(imageRef, imageBuffer, { contentType: image.mimetype });
      return await getDownloadURL(imageRef);
    };

    // Upload images to Firebase if they exist in the request
    const productImage1Url = productImages.productimage1
      ? await uploadImage(productImages.productimage1[0])
      : existingProduct.productimage1;
    const productImage2Url = productImages.productimage2
      ? await uploadImage(productImages.productimage2[0])
      : existingProduct.productimage2;
    const productImage3Url = productImages.productimage3
      ? await uploadImage(productImages.productimage3[0])
      : existingProduct.productimage3;

    // Sửa thông tin sản phẩm
    const updatedProduct = await pool.query(
      `UPDATE product
        SET productname = $1, productimage1 = $2, productimage2 = $3, productimage3 = $4, categoryid = $5, farmid = $6, overviewdes = $7, healtbenefit = $8, cookingmethod = $9, storagemethod = $10, isdistributorview = $11
        WHERE productid = $12
        RETURNING *`,
      [
        productname,
        productImage1Url,
        productImage2Url,
        productImage3Url,
        categoryid,
        farmid,
        overviewdes,
        healtbenefit,
        cookingmethod,
        storagemethod,
        isdistributorview,
        productid,
      ]
    );

    // Trả về thông tin sản phẩm vừa sửa
    res.json({
      product: updatedProduct.rows[0],
      message: "Sửa sản phẩm thành công",
    });
  } catch (error) {
    console.error("error updating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  const { productid } = req.params;

  try {
    // Kiểm tra sản phẩm có tồn tại không
    const productQuery = await pool.query(
      "SELECT * FROM product WHERE productid = $1",
      [productid]
    );
    if (productQuery.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Xóa sản phẩm
    await pool.query("DELETE FROM product WHERE productid = $1", [productid]);

    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Thêm lô sản phẩm mới bảng product_batch: batchid, productid, batchname, batchquantity, batchquality, plantingdate, harvestdate, expirydate, batchprice, promotion
exports.createProductBatch = async (req, res) => {
  const { productid } = req.params;
  const {
    unitofmeasure,
    batchquantity,
    // batchquality,
    plantingdate,
    harvestdate,
    expirydate,
    batchprice,
    // promotion,
  } = req.body;
  try {
    // Kiểm tra sản phẩm có tồn tại không
    const productQuery = await pool.query(
      "SELECT * FROM product WHERE productid = $1",
      [productid]
    );
    if (productQuery.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Kiểm tra dữ liệu đầu vào
    if (!unitofmeasure || !batchquantity || !batchprice) {
      return res
        .status(400)
        .json({ message: "Các trường không được để trống" });
    }

    // Thêm lô sản phẩm mới
    const newBatch = await pool.query(
      `INSERT INTO product_batch (productid, unitofmeasure, batchquantity, batchquality, plantingdate, harvestdate, expirydate, batchprice, promotion, isvisible) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
      [
        productid,
        unitofmeasure,
        batchquantity,
        "Tươi",
        plantingdate,
        harvestdate,
        expirydate,
        batchprice,
        0,
        true,
      ]
    );

    // Trả về thông tin lô sản phẩm vừa tạo
    res.json({
      batch: newBatch.rows[0],
      message: "Tạo lô sản phẩm thành công",
    });
  } catch (error) {
    console.error("Error creating product batch:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Xem danh sách các lô hàng
exports.getProductBatchByProductId = async (req, res) => {
  const { productid } = req.params;
  try {
    // Kiểm tra sản phẩm có tồn tại không
    const productQuery = await pool.query(
      "SELECT * FROM product WHERE productid = $1",
      [productid]
    );
    if (productQuery.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Lấy danh sách các lô hàng của sản phẩm
    const batches = await pool.query(
      "SELECT * FROM product_batch WHERE productid = $1",
      [productid]
    );

    // Trả về danh sách các lô hàng
    res.json(batches.rows);
  } catch (error) {
    console.error("Error fetching product batches:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy danh sách lô hàng cho khách hàng
exports.getProductBatchForCustomer = async (req, res) => {
  const { productid } = req.params;
  try {
    // Kiểm tra sản phẩm có tồn tại không
    const productQuery = await pool.query(
      "SELECT * FROM product WHERE productid = $1",
      [productid]
    );
    if (productQuery.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
    }
    // Lấy danh sách các lô hàng của sản phẩm
    const batches = await pool.query(
      "SELECT * FROM product_batch WHERE productid = $1 AND isvisible = true",
      [productid]
    );

    // Trả về danh sách các lô hàng
    res.json(batches.rows);
  } catch (error) {
    console.error("Error fetching product batches:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Sửa thông tin lô hàng
exports.updateProductBatch = async (req, res) => {
  const { batchid } = req.params;
  const {
    unitofmeasure,
    batchquantity,
    batchquality,
    plantingdate,
    harvestdate,
    expirydate,
    batchprice,
    promotion,
  } = req.body;
  try {
    // Kiểm tra lô hàng có tồn tại không
    const batchQuery = await pool.query(
      "SELECT * FROM product_batch WHERE batchid = $1",
      [batchid]
    );
    if (batchQuery.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy lô hàng" });
    }

    // Kiểm tra dữ liệu đầu vào
    // if (!unitofmeasure || !batchquantity || !batchquality || !batchprice || !promotion) {
    //   return res.status(400).json({ message: "Các trường không được để trống" });
    // }

    // Sửa thông tin lô hàng
    const updatedBatch = await pool.query(
      `UPDATE product_batch
        SET unitofmeasure = $1, batchquantity = $2, batchquality = $3, plantingdate = $4, harvestdate = $5, expirydate = $6, batchprice = $7, promotion = $8
        WHERE batchid = $9
        RETURNING *`,
      [
        unitofmeasure,
        batchquantity,
        batchquality,
        plantingdate,
        harvestdate,
        expirydate,
        batchprice,
        promotion,
        batchid,
      ]
    );

    // Trả về thông tin lô hàng vừa sửa
    res.json({
      batch: updatedBatch.rows[0],
      message: "Sửa thông tin lô hàng thành công",
    });
  } catch (error) {
    console.error("Error fetching product batches:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateProductBatchVisibility = async (req, res) => {
  const { batchid } = req.params;
  const { isVisible } = req.body;

  try {
    // Cập nhật trạng thái ẩn hiện lô hàng và kiểm tra sự tồn tại của lô hàng trong một truy vấn duy nhất
    const updateQuery = `UPDATE product_batch SET isvisible = $1 WHERE batchid = $2 RETURNING *;`;
    const result = await pool.query(updateQuery, [isVisible, batchid]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy lô hàng" });
    }

    res.json({
      message: "Cập nhật trạng thái ẩn hiện lô hàng thành công",
      isVisible: result.rows[0].isvisible,
    });
  } catch (error) {
    console.error("Error updating product batch visibility:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Xóa lô hàng
exports.deleteProductBatch = async (req, res) => {
  const { batchid } = req.params;
  try {
    // Kiểm tra lô hàng có tồn tại không
    const batchQuery = await pool.query(
      "SELECT * FROM product_batch WHERE batchid = $1",
      [batchid]
    );
    if (batchQuery.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy lô hàng" });
    }

    // Xóa lô hàng
    await pool.query("DELETE FROM product_batch WHERE batchid = $1", [batchid]);

    res.json({ message: "Xóa lô hàng thành công" });
  } catch (error) {
    console.error("Error deleting product batch:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// distributor controller
exports.getAllProductsToDistributor = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize, 10);

  try {
    // Lấy tổng số sản phẩm
    const totalProductsResult = await pool.query(
      "SELECT COUNT(*) FROM product"
    );
    const totalProducts = parseInt(totalProductsResult.rows[0].count, 10);

    // Lấy sản phẩm với thông tin farmname và categoryname, sắp xếp theo isvisibleweb
    const productsQuery = `
      SELECT p.*, f.farmname, c.categoryname
      FROM product p
      JOIN farm f ON p.farmid = f.farmid
      JOIN category c ON p.categoryid = c.categoryid
      WHERE p.isdistributorview = true
      ORDER BY p.isvisibleweb ASC
      LIMIT $1 OFFSET $2
    `;
    const productsResult = await pool.query(productsQuery, [limit, offset]);

    res.json({
      products: productsResult.rows,
      pagination: {
        totalProducts,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Tìm kiếm cho distributor theo productname, farmname, categoryname
exports.searchProductsForDistributor = async (req, res) => {
  const { page = 1, pageSize = 10, query } = req.query;
  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize, 10);

  try {
    // Câu truy vấn lấy sản phẩm theo các tiêu chí
    const baseQuery = `
      SELECT 
        p.*, 
        f.farmname, 
        f.farmprovince,
        c.categoryname
      FROM 
        product p
      JOIN 
        farm f 
      ON 
        p.farmid = f.farmid
      JOIN
        category c
      ON
        p.categoryid = c.categoryid
      WHERE 
        (p.productname ILIKE $1 OR c.categoryname ILIKE $1 OR f.farmprovince ILIKE $1 OR f.farmname ILIKE $1)  
        AND p.isvisibleweb = true
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT 
        COUNT(*)
      FROM 
        product p
      JOIN 
        farm f 
      ON 
        p.farmid = f.farmid
      JOIN
        category c
      ON
        p.categoryid = c.categoryid
      WHERE 
        (p.productname ILIKE $1 OR c.categoryname ILIKE $1 OR f.farmprovince ILIKE $1 OR f.farmname ILIKE $1)  
        AND p.isvisibleweb = true
    `;

    const searchQuery = `%${query}%`;

    // Truy vấn tổng số sản phẩm
    const totalProductsResult = await pool.query(countQuery, [searchQuery]);
    const totalProducts = parseInt(totalProductsResult.rows[0].count, 10);

    // Truy vấn lấy sản phẩm dựa trên các tiêu chí
    const productsResult = await pool.query(baseQuery, [
      searchQuery,
      limit,
      offset,
    ]);

    // Lấy danh sách id sản phẩm
    const productIds = productsResult.rows.map((item) => item.productid);

    // Kiểm tra nếu danh sách ID sản phẩm trống
    if (productIds.length === 0) {
      return res.status(200).json({
        products: [],
        pagination: {
          totalProducts,
          currentPage: parseInt(page, 10),
          pageSize: limit,
          totalPages: Math.ceil(totalProducts / limit),
        },
      });
    }

    // Lấy điểm đánh giá trung bình cho mỗi sản phẩm
    const reviewQuery = `
      SELECT 
        productid, 
        AVG(rating) as average_rating
      FROM 
        review
      WHERE 
        productid IN (${productIds.map((id) => `'${id}'`).join(",")})
      GROUP BY 
        productid
    `;
    const reviewResults = await pool.query(reviewQuery);
    const reviewMap = reviewResults.rows.reduce((acc, row) => {
      acc[row.productid] = parseFloat(row.average_rating).toFixed(1);
      return acc;
    }, {});

    // Kết hợp điểm đánh giá trung bình với danh sách sản phẩm
    const productsWithRatings = productsResult.rows.map((product) => ({
      ...product,
      average_rating: reviewMap[product.productid],
    }));

    // Trả về kết quả sản phẩm và thông tin phân trang
    res.json({
      products: productsWithRatings,
      pagination: {
        totalProducts,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Cập nhật chất lượng sản phẩm
exports.updateProductQuality = async (req, res) => {
  const { productid } = req.params;
  const { productquality } = req.body;

  try {
    // Cập nhật chất lượng sản phẩm và kiểm tra sự tồn tại của sản phẩm trong một truy vấn duy nhất
    const updateQuery = `
      UPDATE product 
      SET productquality = $1 
      WHERE productid = $2 
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [productquality, productid]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({
      message: "Cập nhật chất lượng sản phẩm thành công",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating product quality:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Ẩn hiện sản phẩm trên trang chủ
exports.updateProductVisibility = async (req, res) => {
  const { productid } = req.params;
  const { isVisible } = req.body;

  try {
    // Cập nhật trạng thái ẩn hiện sản phẩm và kiểm tra sự tồn tại của sản phẩm trong một truy vấn duy nhất
    const updateQuery = `
      UPDATE product 
      SET isvisibleweb = $1 
      WHERE productid = $2 
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [isVisible, productid]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({
      message: "Cập nhật trạng thái sản phẩm thành công",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating product visibility:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Cập nhật giá sản phẩm
exports.updateProductPrice = async (req, res) => {
  const { productid } = req.params;
  const { productprice } = req.body;

  try {
    const updateQuery = `
      UPDATE product 
      SET productprice = $1 
      WHERE productid = $2 
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [productprice, productid]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({
      message: "Cập nhật giá sản phẩm thành công",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating product price:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Cập nhật giảm giá sản phẩm
exports.updateProductPromotion = async (req, res) => {
  const { productid } = req.params;
  const { promotion } = req.body;

  try {
    const updateQuery = `
      UPDATE product 
      SET promotion = $1 
      WHERE productid = $2 
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [promotion, productid]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({
      message: "Cập nhật giảm giá sản phẩm thành công",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating product promotion:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
