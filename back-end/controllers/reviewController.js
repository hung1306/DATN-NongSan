const pool = require("../config/dbConnect");
const addUserInteraction = require("../utils/addUserInteraction");

const addReview = async (req, res) => {
  const { userId, productId, rating, comment } = req.body;
  const reviewTime = new Date();
  // Validate input data
  if (!userId || !productId || !rating || !comment) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  const sql = `INSERT INTO review (userid, productid, rating, comment, reviewtime) VALUES ($1, $2, $3, $4, $5)`;
  const values = [userId, productId, rating, comment, reviewTime];

  try {
    await pool.query(sql, values);

    // Thêm vào bảng user_item_interactions
    await addUserInteraction(userId, productId, 'review', rating);

    res.status(201).json({ message: "Thêm đánh giá thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllReviewByProductId = async (req, res) => {
  const productId = req.params.productId;
  const sql = `SELECT * FROM review WHERE productid = $1 ORDER BY reviewtime DESC`;
  const values = [productId];

  try {
    const result = await pool.query(sql, values);
    res.json(result.rows);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const getAmountOfReview = async (req, res) => {
  const productId = req.params.productId;
  const sql = `SELECT COUNT(*) FROM review WHERE rating = $1 AND productid = $2`;
  const reviewCounts = [];
  
  try {
    let totalReviews = 0;
    let totalSumOfRatings = 0;
    for (let rating = 1; rating <= 5; rating++) {
      const queryResult = await pool.query(sql, [rating, productId]);
      const count = parseInt(queryResult.rows[0].count, 10);
      
      totalReviews += count;
      totalSumOfRatings += count * rating
      reviewCounts.push(count);
    }
    
    reviewCounts.push(totalReviews);
    const averageRating = totalReviews > 0 ? (totalSumOfRatings / totalReviews).toFixed(1) : 0;

    reviewCounts.push(averageRating);

    res.json(reviewCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { addReview, getAllReviewByProductId, getAmountOfReview };