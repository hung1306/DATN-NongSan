const axios = require("axios");
const pool = require("../config/dbConnect");
const FormData = require("form-data");
const fs = require("fs");

// Function to search for product info by image
const searchByImage = async (req, res) => {
  try {
    // Tạo đối tượng FormData
    const formData = new FormData();
    formData.append("image", req.file.buffer, req.file.originalname); // Đính kèm file ảnh

    // Gửi request đến Flask API
    const flaskApiUrl = "http://127.0.0.1:12000/search-image";
    const flaskResponse = await axios.post(flaskApiUrl, formData, {
      headers: {
        ...formData.getHeaders(), // Lấy headers từ form-data
      },
    });

    // Lấy danh sách product_id từ response của Flask API
    const productIds = flaskResponse.data.product_ids;

    // Kiểm tra nếu danh sách ID sản phẩm trống
    if (productIds.length === 0) {
      return res.status(200).json({ products: [] });
    }

    // Truy vấn PostgreSQL để lấy thông tin sản phẩm dựa trên product_id
    const productQuery = `
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
        WHERE isvisible = true
        ORDER BY productid, batchprice ASC
      ) pb
      ON 
        p.productid = pb.productid
      WHERE 
        p.productid = ANY($1::uuid[])
    `;
    const result = await pool.query(productQuery, [productIds]);

    // Lấy điểm đánh giá trung bình cho mỗi sản phẩm
    const reviewQuery = `
      SELECT 
        productid, 
        AVG(rating) as average_rating
      FROM 
        review
      WHERE 
        productid = ANY($1::uuid[])
      GROUP BY 
        productid
    `;
    const reviewResults = await pool.query(reviewQuery, [productIds]);
    const reviewMap = reviewResults.rows.reduce((acc, row) => {
      acc[row.productid] = parseFloat(row.average_rating).toFixed(1);
      return acc;
    }, {});

    // Kết hợp điểm đánh giá trung bình với danh sách sản phẩm
    const productsWithRatings = result.rows.map((product) => ({
      ...product,
      average_rating: reviewMap[product.productid] || 0,
    }));

    // Trả về thông tin sản phẩm
    res.json({
      products: productsWithRatings,
    });
  } catch (error) {
    console.error("Error occurred during image search:", error);
    res.status(500).json({ message: "Error occurred during image search" });
  }
};

module.exports = { searchByImage };
