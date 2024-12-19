const pool = require("../config/dbConnect");

// Hàm để thêm tương tác của người dùng vào bảng user_item_interactions
const addUserInteraction = async (userId, productId, interactionType, interactionScore) => {
  const query = `
    INSERT INTO user_item_interactions (user_id, productid, interaction_type, interaction_score) 
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(query, [userId, productId, interactionType, interactionScore]);
};

module.exports = addUserInteraction;