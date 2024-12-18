const axios = require("axios");
const pool = require("../config/dbConnect");

const getRecommendation = async (req, res) => {
  const userId = req.params.userId || '16b9ab12-3876-4b2e-a983-57c491b9e3de';
  const url = `http://127.0.0.1:8080/recommendation`;

  try {
    // Gửi yêu cầu GET tới API Flask với user_id
    const response = await axios.get(url, {
      params: {
        user_id: userId
      }
    });
    const recommendation = response.data.recommendations || [];
    console.log(response.data.evaluation);
    // Lấy danh sách id sản phẩm
    const productIds = recommendation.map((item) => item.productid);

    // Kiểm tra nếu danh sách ID sản phẩm trống
    if (productIds.length === 0) {
      return res.status(200).json([]);
    }

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
          p.productid IN (${productIds.map(id => `'${id}'`).join(",")}) 
          AND p.isvisibleweb = true
      `;
    const productsWithFarm = await pool.query(query);

    // Lấy điểm đánh giá trung bình cho mỗi sản phẩm
    const reviewQuery = `
      SELECT 
        productid, 
        AVG(rating) as average_rating
      FROM 
        review
      WHERE 
        productid IN (${productIds.map(id => `'${id}'`).join(",")})
      GROUP BY 
        productid
    `;
    const reviewResults = await pool.query(reviewQuery);
    const reviewMap = reviewResults.rows.reduce((acc, row) => {
      acc[row.productid] = parseFloat(row.average_rating).toFixed(1);
      return acc;
    }, {});

    // Kết hợp điểm đánh giá trung bình với danh sách sản phẩm
    const productsWithRatings = productsWithFarm.rows.map(product => ({
      ...product,
      average_rating: reviewMap[product.productid] || 0
    }));

    // Trả về kết quả
    res.status(200).json(productsWithRatings);

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { getRecommendation };