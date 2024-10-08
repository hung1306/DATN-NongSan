const pool = require("../config/dbConnect");
const Stripe = require("stripe");

// Khởi tạo Stripe với Secret Key của bạn
const stripe = new Stripe(
  "sk_test_51Q60zuLnoPrvRvUr7Msx3CeaKGBLEyDDn57TsONndc2nrW33yAsbZC05P45knHaNcZjuXQExjAu6LhOxe52S3BT000GTK4vivT"
);

// Các trạng thái đơn hàng: Đã tạo, Đã xác nhận, Đang giao, Đã giao, Đã hủy
// Những trạng thái cập nhật số lượng trong bảng Product: Đã giao, Đã hủy
// Các phương thức thanh toán: Thanh toán khi nhận hàng, Thanh toán qua thẻ
const addCheckOut = async (req, res) => {
  const {
    userId,
    paymentMethod,
    items,
    shippingAddress,
    estimatedDeliveryTime,
  } = req.body;

  if (
    !userId ||
    !paymentMethod ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  const orderStatus = "Đã tạo";
  const paymentStatus = "Đang chờ";
  const currentTime = new Date();

  function groupProductsByFarmId(products) {
    const grouped = products.reduce((result, product) => {
      let group = result.find((g) => g[0].farmid === product.farmid);
      if (!group) {
        group = [];
        result.push(group);
      }
      group.push(product);
      return result;
    }, []);
    return grouped;
  }

  const sqlOrder = `INSERT INTO "Order" (userid, estimatedelivery, shippingaddress, orderstatus, ordercreatetime, orderupdatetime, totalamount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING orderid`;
  const sqlOrderItem = `INSERT INTO orderitem (orderid, productid, quantityofitem) VALUES ($1, $2, $3)`;
  const sqlPayment = `INSERT INTO payment (orderid, userid, paymentmethod, paymentstatus, paymentcreatetime, paymentupdatetime, totalamount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING paymentid`;
  const sqlUpdateProduct = `UPDATE product SET productquantity = productquantity - $1 WHERE productid = $2`;
  const sqlDeleteCart = `DELETE FROM cart WHERE productid = $1`;
  const sqlInsertHistory = `INSERT INTO purchaseshistory (orderid, paymentid, purchasedate, totalamount) VALUES ($1, $2, NOW(), $3)`;

  const executeQuery = (query, values) => pool.query(query, values);

  try {
    await pool.query(`START TRANSACTION`);

    const itemsByFarm = groupProductsByFarmId(items);

    for (const farmItems of itemsByFarm) {
      const total = farmItems.reduce(
        (sum, item) =>
          sum + item.productprice * (1 - 0.01 * item.promotion) * item.quantity,
        0
      );

      const resultOrder = await executeQuery(sqlOrder, [
        userId,
        estimatedDeliveryTime,
        shippingAddress,
        orderStatus,
        currentTime,
        currentTime,
        total,
      ]);
      const orderId = resultOrder.rows[0].orderid;

      const orderItemsPromises = farmItems.map((item) =>
        executeQuery(sqlOrderItem, [orderId, item.productid, item.quantity])
      );
      await Promise.all(orderItemsPromises);

      const resultPayment = await executeQuery(sqlPayment, [
        orderId,
        userId,
        paymentMethod,
        paymentStatus,
        currentTime,
        currentTime,
        total,
      ]);
      const paymentId = resultPayment.rows[0].paymentid;

      const updateProductPromises = farmItems.map((item) =>
        executeQuery(sqlUpdateProduct, [item.quantity, item.productId])
      );
      await Promise.all(updateProductPromises);

      await executeQuery(sqlInsertHistory, [orderId, paymentId, total]);

      for (const item of farmItems) {
        await executeQuery(sqlDeleteCart, [item.productid]);
      }
    }

    await pool.query(`COMMIT`);
    // Tra ve chi tiet don hang

    res.json({ message: "Đơn hàng đã được tạo thành công" });
  } catch (error) {
    console.error("Error occurred:", error);
    await pool.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
};

const getShippingInfo = async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM "User" WHERE userid = $1`;
  try {
    const result = await pool.query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const deliveryAddress =
      result.rows[0].street +
      ", " +
      result.rows[0].commune +
      ", " +
      result.rows[0].district +
      ", " +
      result.rows[0].province;
    // Calculate estimated delivery time as now + 4 hours
    const estimatedDeliveryTime = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const returnResult = {
      deliveryAddress,
      estimatedDeliveryTime,
    };
    res.json(returnResult);
  } catch (error) {
    console.error("Error fetching transfer info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// get purchase history by userId
const getPurchaseHistory = async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  try {
    // Fetch total count of orders
    const totalCountResult = await pool.query(
      `SELECT COUNT(*) FROM "Order" WHERE userid = $1`,
      [userId]
    );
    const totalCount = parseInt(totalCountResult.rows[0].count);

    // Fetch order IDs with pagination
    const getOrderIds = `
      SELECT orderid FROM "Order" WHERE userid = $1 LIMIT $2 OFFSET $3
    `;
    const orderIds = await pool.query(getOrderIds, [userId, pageSize, offset]);

    if (orderIds.rows.length === 0) {
      return res.status(400).json({ message: "No purchase history found" });
    }

    // Fetch purchase history and order status in a single query
    const orderIdsArray = orderIds.rows.map((order) => order.orderid);
    const getPurchasesHistorySQL = `
      SELECT ph.orderid, ph.purchasedate, ph.totalamount, o.orderstatus
      FROM purchaseshistory ph
      JOIN "Order" o ON ph.orderid = o.orderid
      WHERE ph.orderid = ANY($1::uuid[])
    `;
    const purchasesHistory = await pool.query(getPurchasesHistorySQL, [
      orderIdsArray,
    ]);

    const result = purchasesHistory.rows.map((row) => ({
      orderId: row.orderid,
      purchaseDate: row.purchasedate,
      totalAmount: row.totalamount,
      orderStatus: row.orderstatus,
    }));

    res.json({
      purchaseHistory: result,
      pagination: {
        totalItems: totalCount,
        currentPage: page,
        pageSize: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrderItemById = async (req, res) => {
  const { orderId } = req.params;
  const sql = `SELECT * FROM orderitem WHERE orderid = $1`;
  try {
    const orderItem = await pool.query(sql, [orderId]);
    //Lay thong tin san pham tu bang product
    const result = [];
    for (const item of orderItem.rows) {
      const getProductSQL = `SELECT * FROM product WHERE productid = $1`;
      const product = await pool.query(getProductSQL, [item.productid]);
      //Viết để tránh trường hợp sản phẩm đã bị xóa khỏi bảng product
      if (product.rows.length === 0) {
        continue;
      }
      const temp = {
        productimage1: product.rows[0].productimage1,
        productname: product.rows[0].productname,
        overview: product.rows[0].overviewdes,
        quantity: item.quantityofitem,
      };
      result.push(temp);
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// farmer show orders
const getAllOrdersByFarmer = async (req, res) => {
  const { farmerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const farmIdQuery = `SELECT farmid FROM farm WHERE userid = $1`;
    const farmIdResult = await pool.query(farmIdQuery, [farmerId]);
    if (farmIdResult.rows.length === 0) {
      return res.status(400).json({ error: "Farmer not found" });
    }

    const productIds = await Promise.all(
      farmIdResult.rows.map(async (farm) => {
        const productQuery = `SELECT productid FROM product WHERE farmid = $1`;
        const productResult = await pool.query(productQuery, [farm.farmid]);
        return productResult.rows.map((product) => product.productid);
      })
    ).then((results) => results.flat());

    if (productIds.length === 0) {
      return res.status(400).json({ error: "Product not found" });
    }

    const orderItems = await Promise.all(
      productIds.map(async (productId) => {
        const orderItemQuery = `SELECT * FROM orderitem WHERE productid = $1`;
        const orderItemResult = await pool.query(orderItemQuery, [productId]);
        return orderItemResult.rows;
      })
    ).then((results) => results.flat());

    const uniqueOrderItems = Array.from(
      new Set(orderItems.map((item) => item.orderid))
    ).map((orderId) => orderItems.find((item) => item.orderid === orderId));

    const totalItemsQuery = `SELECT COUNT(*) FROM "Order" WHERE orderid = ANY($1::uuid[])`;
    const totalItemsResult = await pool.query(totalItemsQuery, [
      uniqueOrderItems.map((item) => item.orderid),
    ]);
    const totalItems = parseInt(totalItemsResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const ordersQuery = `
      SELECT o.*, u.fullname
      FROM "Order" o
      JOIN "User" u ON o.userid = u.userid
      WHERE o.orderid = ANY($1::uuid[])
      ORDER BY o.orderid
      LIMIT $2 OFFSET $3
    `;
    const ordersResult = await pool.query(ordersQuery, [
      uniqueOrderItems.map((item) => item.orderid),
      limit,
      offset,
    ]);

    res.json({
      totalItems,
      totalPages,
      currentPage: page,
      orders: ordersResult.rows,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrderDetailFarmer = async (req, res) => {
  const { orderId } = req.params;
  try {
    const orderQuery = `SELECT * FROM "Order" WHERE orderid = $1`;
    const orderResult = await pool.query(orderQuery, [orderId]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderResult.rows[0];
    const orderItemQuery = `SELECT * FROM orderitem WHERE orderid = $1`;
    const orderItemResult = await pool.query(orderItemQuery, [orderId]);
    const orderItems = orderItemResult.rows;
    const items = await Promise.all(
      orderItems.map(async (item) => {
        const productQuery = `SELECT * FROM product WHERE productid = $1`;
        const productResult = await pool.query(productQuery, [item.productid]);
        const product = productResult.rows[0];
        return {
          productId: product.productid,
          productName: product.productname,
          productImage: product.productimage1,
          quantity: item.quantityofitem,
          price: product.productprice,
          unitofmeasure: product.unitofmeasure,
          overviewdes: product.overviewdes,
        };
      })
    );
    const userQuery = `SELECT * FROM "User" WHERE userid = $1`;
    const userResult = await pool.query(userQuery, [order.userid]);
    const user = userResult.rows[0];
    const paymentQuery = `SELECT * FROM payment WHERE orderid = $1`;
    const paymentResult = await pool.query(paymentQuery, [orderId]);
    const payment = paymentResult.rows[0];
    const returnResult = {
      orderId: order.orderid,
      orderStatus: order.orderstatus,
      orderCreateTime: order.ordercreatetime,
      orderUpdateTime: order.orderupdatetime,
      totalAmount: order.totalamount,
      deliveryAddress: order.shippingaddress,
      estimatedDeliveryTime: order.estimatedelivery,
      paymentMethod: payment.paymentmethod,
      paymentStatus: payment.paymentstatus,
      paymentCreateTime: payment.paymentcreatetime,
      paymentUpdateTime: payment.paymentupdatetime,
      user: {
        userId: user.userid,
        fullName: user.fullname,
        email: user.email,
        phonenumber: user.phonenumber,
      },
      items,
    };
    res.json(returnResult);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateStatusOrder = async (req, res) => {
  const { orderId, status } = req.body;
  const currentTime = new Date();
  const sql = `UPDATE "Order" SET orderstatus = $1, orderupdatetime = $2 WHERE orderid = $3`;
  try {
    await pool.query(sql, [status, currentTime, orderId]);

    res.json({
      message: "Cập nhật thành công",
      updateTime: currentTime,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createPaymentIntent = async (req, res) => {
  const {
    amount,
    currency,
    userId,
    items,
    shippingAddress,
    estimatedDeliveryTime,
  } = req.body;

  try {
    // Bắt đầu một giao dịch
    await pool.query("BEGIN");

    // Tạo đơn hàng mới
    const orderStatus = "Đã thanh toán";
    const currentTime = new Date();
    const total = items.reduce(
      (sum, item) =>
        sum + item.productprice * (1 - 0.01 * item.promotion) * item.quantity,
      0
    );

    const sqlOrder = `INSERT INTO "Order" (userid, estimatedelivery, shippingaddress, orderstatus, ordercreatetime, orderupdatetime, totalamount) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING orderid`;

    const resultOrder = await pool.query(sqlOrder, [
      userId,
      estimatedDeliveryTime,
      shippingAddress,
      orderStatus,
      currentTime,
      currentTime,
      total,
    ]);

    const orderId = resultOrder.rows[0].orderid;

    // Lưu các mục đơn hàng
    const sqlOrderItem = `INSERT INTO orderitem (orderid, productid, quantityofitem) VALUES ($1, $2, $3)`;

    for (const item of items) {
      await pool.query(sqlOrderItem, [orderId, item.productid, item.quantity]);
    }

    // Cam kết giao dịch
    await pool.query("COMMIT");

    // Tạo Payment Intent từ Stripe có kèm `orderId` trong metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { orderId: orderId.toString() },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderId, // Gửi client secret về frontend
    });
  } catch (error) {
    console.error("Error occurred:", error);
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Failed to create payment intent" });
  }
};

const savePaymentToDB = async (req, res) => {
  const { userId, orderId, amount, paymentMethod, paymentId } = req.body; // Bỏ paymentIntentId

  try {
    // Lưu thông tin thanh toán vào bảng "payment" (không cần paymentIntentId)
    const sqlPayment = `
      INSERT INTO payment 
      (orderid, userid, totalamount, paymentstatus, paymentcreatetime, paymentmethod, paymentupdatetime) 
      VALUES ($1, $2, $3, $4, NOW(), $5, NOW()) RETURNING paymentid`;

    const paymentStatus = "Đang chờ"; // Trạng thái thanh toán thành công từ Stripe
    const result = await pool.query(sqlPayment, [
      orderId,
      userId,
      amount,
      paymentStatus,
      paymentMethod,
    ]);

    const paymentId = result.rows[0].paymentid;

    // Lưu lịch sử mua hàng vào bảng purchaseshistory
    const sqlInsertHistory = `
      INSERT INTO purchaseshistory 
      (orderid, paymentid, purchasedate, totalamount) 
      VALUES ($1, $2, NOW(), $3)`;

    await pool.query(sqlInsertHistory, [orderId, paymentId, amount]);

    res.status(200).json({ message: "Lưu thông tin thanh toán thành công" });
  } catch (error) {
    console.error("Error saving payment info:", error);
    res.status(500).json({ error: "Failed to save payment info" });
  }
};

module.exports = {
  addCheckOut,
  getShippingInfo,
  getPurchaseHistory,
  getOrderItemById,
  getAllOrdersByFarmer,
  getOrderDetailFarmer,
  updateStatusOrder,
  createPaymentIntent,
  savePaymentToDB,
};
