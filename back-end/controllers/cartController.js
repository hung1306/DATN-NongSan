const pool = require("../config/dbConnect");

const getBatchQuantity = async (batchId) => {
  const query = `SELECT batchquantity FROM product_batch WHERE batchid = $1`;
  const result = await pool.query(query, [batchId]);
  return result.rows.length > 0 ? result.rows[0].batchquantity : null;
};

const getExistingProduct = async (userId, productId, batchId) => {
  const query = `SELECT * FROM cart WHERE userid = $1 AND productid = $2 AND batchid = $3`;
  const result = await pool.query(query, [userId, productId, batchId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

const updateCartQuantity = async (quantity, userId, productId, batchId) => {
  const query = `
    UPDATE cart SET quantity = quantity + $1 
    WHERE userid = $2 AND productid = $3 AND batchid = $4 
    RETURNING *
  `;
  const result = await pool.query(query, [
    quantity,
    userId,
    productId,
    batchId,
  ]);
  return result.rows[0];
};

const insertCart = async (userId, productId, quantity, batchId) => {
  const query = `
    INSERT INTO cart (userid, productid, quantity, batchid) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `;
  const result = await pool.query(query, [
    userId,
    productId,
    quantity,
    batchId,
  ]);
  return result.rows[0];
};

exports.addToCart = async (req, res) => {
  const { userId, productId, quantity, batchId } = req.body;

  if (quantity === 0) {
    return res
      .status(400)
      .json({ message: "Số lượng sản phẩm phải lớn hơn 0" });
  }

  try {
    const batchQuantity = await getBatchQuantity(batchId);

    if (batchQuantity === null) {
      return res.status(400).json({ message: "Batch không tồn tại" });
    }

    if (quantity > batchQuantity) {
      return res
        .status(400)
        .json({ message: "Số lượng sản phẩm vượt quá số lượng trong kho" });
    }

    const existingProduct = await getExistingProduct(
      userId,
      productId,
      batchId
    );

    if (existingProduct) {
      const updatedCart = await updateCartQuantity(
        quantity,
        userId,
        productId,
        batchId
      );
      return res.status(200).json(updatedCart);
    }

    const cart = await insertCart(userId, productId, quantity, batchId);
    res.status(200).json(cart);
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
    // Fetch total count of cart items and cart items with pagination
    const [totalCountResult, cart] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM cart WHERE userid = $1", [userId]),
      pool.query("SELECT * FROM cart WHERE userid = $1 LIMIT $2 OFFSET $3", [
        userId,
        pageSize,
        offset,
      ]),
    ]);

    const totalCount = parseInt(totalCountResult.rows[0].count);

    // if (cart.rows.length === 0) {
    //   return res.status(400).json({ message: "Giỏ hàng của bạn đang trống" });
    // }

    // Get product IDs and batch IDs from cart items
    const productIds = cart.rows.map((item) => item.productid);
    const batchIds = cart.rows.map((item) => item.batchid);

    // Fetch product details, quantities, batch details, and farm names in a single query
    const products = await pool.query(
      `SELECT p.*, c.quantity, pb.*, f.farmname
        FROM product p 
        JOIN cart c ON p.productid = c.productid 
        JOIN product_batch pb ON c.batchid = pb.batchid
        JOIN farm f ON p.farmid = f.farmid
        WHERE c.userid = $1 AND c.productid = ANY($2::uuid[]) AND c.batchid = ANY($3::uuid[])`,
      [userId, productIds, batchIds]
    );

    // Map product details, batch details, and farm names to cart items
    const cartItems = cart.rows.map((cartItem) => {
      const product = products.rows.find(
        (p) =>
          p.productid === cartItem.productid && p.batchid === cartItem.batchid
      );
      return {
        ...product,
        quantity: cartItem.quantity,
        farmname: product.farmname || null,
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
