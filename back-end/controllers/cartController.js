const pool = require("../config/dbConnect");

exports.addToCart = async (req, res) => {
  const { userId, productId, quantity, batchId } = req.body;

  if (quantity === 0) {
    return res.status(400).json({ message: "Số lượng sản phẩm phải lớn hơn 0" });
  }

  try {
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng hay chưa
    const existingProductQuery = `
      SELECT * FROM cart WHERE userid = $1 AND productid = $2 AND batchid = $3
    `;
    const existingProduct = await pool.query(existingProductQuery, [userId, productId, batchId]);

    if (existingProduct.rows.length > 0) {
      // Cập nhật số lượng nếu sản phẩm đã tồn tại trong giỏ hàng
      const updateCartQuery = `
        UPDATE cart SET quantity = quantity + $1 
        WHERE userid = $2 AND productid = $3 AND batchid = $4 
        RETURNING *
      `;
      const updatedCart = await pool.query(updateCartQuery, [quantity, userId, productId, batchId]);
      return res.status(200).json(updatedCart.rows[0]);
    }

    // Thêm sản phẩm mới vào giỏ hàng
    const insertCartQuery = `
      INSERT INTO cart (userid, productid, quantity, batchid) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const cart = await pool.query(insertCartQuery, [userId, productId, quantity, batchId]);
    res.status(200).json(cart.rows[0]);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy tất cả sản phẩm trong giỏ hàng của người dùng
exports.getAllCart = async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  try {
    // Fetch total count of cart items
    const totalCountResult = await pool.query(
      "SELECT COUNT(*) FROM cart WHERE userid = $1",
      [userId]
    );
    const totalCount = parseInt(totalCountResult.rows[0].count);

    // Fetch cart items with pagination
    const cart = await pool.query(
      "SELECT * FROM cart WHERE userid = $1 LIMIT $2 OFFSET $3",
      [userId, pageSize, offset]
    );

    if (cart.rows.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng của bạn đang trống" });
    }

    // Get product IDs and batch IDs from cart items
    const productIds = cart.rows.map((item) => item.productid);
    const batchIds = cart.rows.map((item) => item.batchid);

    // Fetch product details, quantities, and batch details in a single query
    const products = await pool.query(
      `SELECT p.*, c.quantity, pb.*
        FROM product p 
        JOIN cart c ON p.productid = c.productid 
        JOIN product_batch pb ON c.batchid = pb.batchid
        WHERE c.userid = $1 AND c.productid = ANY($2::uuid[]) AND c.batchid = ANY($3::uuid[])`,
      [userId, productIds, batchIds]
    );

    // Map product details and batch details to cart items
    const cartItems = cart.rows.map((cartItem) => {
      const product = products.rows.find(
        (p) => p.productid === cartItem.productid && p.batchid === cartItem.batchid
      );
      return {
        ...product,
        quantity: cartItem.quantity,
      };
    });

    res.status(200).json({
      cartItems,
      pagination: {
        totalItems: totalCount,
        currentPage: page,
        pageSize: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateQuantityCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const updatedCart = await pool.query(
      "UPDATE cart SET quantity = $1 WHERE userid = $2 AND productid = $3 RETURNING *",
      [quantity, userId, productId]
    );
    res.status(200).json(updatedCart.rows[0]);
  } catch (error) {
    console.error("Error updating quantity in cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    await pool.query("DELETE FROM cart WHERE userid = $1 AND productid = $2", [
      userId,
      productId,
    ]);

    res.status(200).json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng" });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
