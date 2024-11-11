const pool = require("../config/dbConnect");

exports.getInfoHomeDistributor = async (req, res) => {
  try {
    // Lấy số lượng sản phẩm trong bảng product
    const productCount = await pool.query("SELECT COUNT(*) FROM product");
    // Lấy số lượng nông trại trong bảng farm
    const farmCount = await pool.query("SELECT COUNT(*) FROM farm");
    // Lấy số lượng khách hàng trong bảng customer
    const customerCount = await pool.query('SELECT COUNT(*) FROM "User" WHERE role = $1', ['customer']);
    // Lấy số lượng đơn hàng trong bảng Order
    const orderCount = await pool.query('SELECT COUNT(*) FROM "Order"');
    // Trả về kết quả
    res.status(200).json({
      productCount: productCount.rows[0].count,
      farmCount: farmCount.rows[0].count,
      customerCount: customerCount.rows[0].count,
      orderCount: orderCount.rows[0].count,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};