const pool = require("../config/dbConnect");

const stripe = require("stripe")(process.env.STRIPE_KEY);
const notificationUtils = require("../utils/notificationsUtils");

const addCheckOut = async (req, res) => {
  const {
    userId,
    paymentMethod,
    items,
    shippingAddress,
    estimatedDeliveryTime,
    totalAmount,
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
  const paymentStatus = "Đang chờ thanh toán";
  const currentTime = new Date();

  const sqlOrder = `INSERT INTO "Order" (userid, estimatedelivery, shippingaddress, orderstatus, ordercreatetime, orderupdatetime, totalamount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING orderid`;
  const sqlOrderItem = `INSERT INTO orderitem (orderid, productid, quantityofitem) VALUES ($1, $2, $3)`;
  const sqlPayment = `INSERT INTO payment (orderid, userid, paymentmethod, paymentstatus, paymentcreatetime, paymentupdatetime, totalamount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING paymentid`;
  const sqlUpdateProduct = `UPDATE product_batch SET batchquantity = batchquantity - $1 WHERE productid = $2`;
  const sqlDeleteCart = `DELETE FROM cart WHERE productid = $1`;
  const sqlInsertHistory = `INSERT INTO purchaseshistory (orderid, paymentid, purchasedate, totalamount) VALUES ($1, $2, NOW(), $3)`;

  const executeQuery = (query, values) => pool.query(query, values);

  try {
    await pool.query(`BEGIN`);

    // Insert into "Order" table
    const resultOrder = await executeQuery(sqlOrder, [
      userId,
      estimatedDeliveryTime,
      shippingAddress,
      orderStatus,
      currentTime,
      currentTime,
      totalAmount,
    ]);
    const orderId = resultOrder.rows[0].orderid;

    // Insert each item into orderitem
    const orderItemsPromises = items.map((item) =>
      executeQuery(sqlOrderItem, [orderId, item.productid, item.quantity])
    );
    await Promise.all(orderItemsPromises);

    // Insert into payment table
    const resultPayment = await executeQuery(sqlPayment, [
      orderId,
      userId,
      paymentMethod,
      paymentStatus,
      currentTime,
      currentTime,
      totalAmount,
    ]);
    const paymentId = resultPayment.rows[0].paymentid;

    // Fetch current quantity and check if sufficient
    const updateProductPromises = items.map(async (item) => {
      const { rows: currentQuantityRows } = await executeQuery(
        "SELECT batchquantity FROM product_batch WHERE batchid = $1",
        [item.batchid]
      );

      const currentQuantity = currentQuantityRows[0].batchquantity;
      console.log("Current quantity:", currentQuantity);
      console.log("Item quantity:", item.quantity);
      const { rows: distributors } = await pool.query(
        "SELECT distributorid FROM distributor LIMIT 1"
      );
      const distributorId = distributors[0].distributorid;
      if (currentQuantity === item.quantity) {
        notificationUtils.createNotification(
          distributorId,
          "Distributor",
          "Hết hàng",
          `Sản phẩm có mã lô hàng ${item.batchid.slice(0, 8)} đã hết hàng`,
          "OutOfStock"
        );
        // set isvisible = false
        await executeQuery(
          "UPDATE product_batch SET isvisible = false WHERE batchid = $1",
          [item.batchid]
        );
      }

      return executeQuery(sqlUpdateProduct, [item.quantity, item.productid]);
    });
    await Promise.all(updateProductPromises);

    // Insert into purchases history
    await executeQuery(sqlInsertHistory, [orderId, paymentId, totalAmount]);

    // Delete items from cart
    const deleteCartPromises = items.map((item) =>
      executeQuery(sqlDeleteCart, [item.productid])
    );
    await Promise.all(deleteCartPromises);

    await pool.query(`COMMIT`);

    // Lấy username từ userid
    const {
      rows: [{ fullname: username }],
    } = await pool.query(`SELECT fullname FROM "User" WHERE userid = $1`, [
      userId,
    ]);
    // Lấy distributorid chỉ lấy distributor đầu
    const distributorQuery = `SELECT distributorid FROM distributor`;
    const distributorResult = await pool.query(distributorQuery);
    const distributorId = distributorResult.rows[0].distributorid;
    // Gọi hàm thông báo cho customer về việc đặt hàng thành công
    notificationUtils.createNotification(
      userId,
      "User",
      "Tạo đơn hàng mới",
      `Đơn hàng ${orderId.slice(0, 8)} đã được tạo thành công!`,
      "CreateNewOrder"
    );
    // Gọi hàm thông báo cho distributor về việc có đơn hàng mới
    notificationUtils.createNotification(
      distributorId,
      "Distributor",
      "Đơn hàng mới",
      `Đơn hàng ${orderId.slice(0, 8)} từ ${username} đã được tạo!`,
      "CreateNewOrder"
    );

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
    const districtDelivery = result.rows[0].district;
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

    console.log(estimatedDeliveryTime);
    const returnResult = {
      deliveryAddress,
      estimatedDeliveryTime,
      districtDelivery,
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

    // Fetch purchase history, order status, and payment status in a single query
    const orderIdsArray = orderIds.rows.map((order) => order.orderid);
    const getPurchasesHistorySQL = `
      SELECT ph.orderid, ph.purchasedate, ph.totalamount, o.orderstatus, p.paymentstatus
      FROM purchaseshistory ph
      JOIN "Order" o ON ph.orderid = o.orderid
      JOIN payment p ON ph.paymentid = p.paymentid
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
      paymentStatus: row.paymentstatus,
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
        // Kiểm tra item có tồn tại và có productid không
        if (!item || !item.productid) {
          console.error("Invalid order item:", item);
          return null; // Hoặc có thể throw error
        }

        const productQuery = `SELECT * FROM product WHERE productid = $1`;
        const productResult = await pool.query(productQuery, [item.productid]);
        const product = productResult.rows[0];

        // Kiểm tra sản phẩm có tồn tại không
        if (!product) {
          console.error("Product not found for productid:", item.productid);
          return null; // Hoặc có thể throw error
        }

        // Lấy giá từ bảng product_batch
        const batchQuery = `SELECT * FROM product_batch WHERE productid = $1 LIMIT 1`; // Chọn một batch giá đầu tiên
        const batchResult = await pool.query(batchQuery, [item.productid]);
        const batch = batchResult.rows[0];

        // Kiểm tra batch có tồn tại không
        if (!batch) {
          console.error("Batch not found for productid:", item.productid);
          return null; // Hoặc có thể throw error
        }

        return {
          productId: product.productid,
          productName: product.productname,
          productImage: product.productimage1,
          quantity: item.quantityofitem,
          price: batch.batchprice, // Sử dụng batchprice từ bảng product_batch
          unitofmeasure: batch.unitofmeasure,
          overviewdes: product.overviewdes,
        };
      })
    );

    // Lọc ra những items hợp lệ (không null)
    const validItems = items.filter((item) => item !== null);

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
      items: validItems, // Chỉ bao gồm các item hợp lệ
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

const createPaymentSession = async (req, res) => {
  const {
    batchprice,
    currency,
    userId,
    items,
    shippingAddress,
    estimatedDeliveryTime,
    totalAmount,
    shippingFee, // Giả sử phí vận chuyển được gửi từ client
  } = req.body;

  try {
    // Bắt đầu một transaction
    await pool.query("BEGIN");

    // Tính tổng tiền cho các sản phẩm
    const total = items.reduce(
      (sum, item) =>
        sum + item.batchprice * (1 - 0.01 * item.promotion) * item.quantity,
      0
    );

    // Cộng phí vận chuyển vào tổng tiền
    const finalTotalAmount = total + shippingFee;

    const sqlOrder = `INSERT INTO "Order" (userid, estimatedelivery, shippingaddress, orderstatus, ordercreatetime, orderupdatetime, totalamount) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING orderid`;
    const orderstatus = "Đã tạo";
    const currentTime = new Date();
    const resultOrder = await pool.query(sqlOrder, [
      userId,
      estimatedDeliveryTime,
      shippingAddress,
      orderstatus,
      currentTime,
      currentTime,
      finalTotalAmount, // Sử dụng tổng số tiền đã bao gồm phí vận chuyển
    ]);

    const orderId = resultOrder.rows[0].orderid;

    // Lưu các item vào Order
    const sqlOrderItem = `INSERT INTO orderitem (orderid, productid, quantityofitem) VALUES ($1, $2, $3)`;
    for (const item of items) {
      await pool.query(sqlOrderItem, [orderId, item.productid, item.quantity]);
    }

    // Xóa sản phẩm khỏi giỏ hàng (cart) sau khi thanh toán thành công
    const sqlDeleteCart = `DELETE FROM cart WHERE userid = $1 AND productid = $2`;
    for (const item of items) {
      await pool.query(sqlDeleteCart, [userId, item.productid]);
    }

    // Tạo session thanh toán với Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items
        .map((item) => ({
          price_data: {
            unit_amount: Math.round(
              item.batchprice * (1 - 0.01 * item.promotion) // Stripe expects the amount in cents
            ),
            currency: currency,
            product_data: {
              name: item.productname,
            },
          },
          quantity: item.quantity,
        }))
        .concat([
          {
            price_data: {
              unit_amount: Math.round(shippingFee), // Phí vận chuyển
              currency: currency,
              product_data: {
                name: "Phí vận chuyển",
              },
            },
            quantity: 1, // Thêm một mục cho phí vận chuyển
          },
        ]),
      mode: "payment",
      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/payment-cancel`,
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
      },
    });

    // Lưu thông tin thanh toán vào bảng payment
    const sqlPayment = `INSERT INTO payment 
      (orderid, userid, paymentmethod, totalamount, paymentstatus, paymentcreatetime, paymentupdatetime) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING paymentid`;

    const paymentMethod = "Thanh toán online"; // Vì đây là thanh toán online
    const paymentStatus = "Đang chờ thanh toán"; // Thanh toán chưa hoàn tất
    const paymentCreateTime = currentTime;
    const paymentUpdateTime = currentTime;

    const resultPayment = await pool.query(sqlPayment, [
      orderId,
      userId,
      paymentMethod,
      finalTotalAmount, // Sử dụng tổng số tiền đã bao gồm phí vận chuyển
      paymentStatus,
      paymentCreateTime,
      paymentUpdateTime,
    ]);

    const paymentId = resultPayment.rows[0].paymentid;

    // Commit transaction và trả về URL của Stripe Checkout
    await pool.query("COMMIT");

    // Lấy username từ userid
    const {
      rows: [{ fullname: username }],
    } = await pool.query(`SELECT fullname FROM "User" WHERE userid = $1`, [
      userId,
    ]);
    // Lấy distributorid chỉ lấy distributor đầu
    const distributorQuery = `SELECT distributorid FROM distributor`;
    const distributorResult = await pool.query(distributorQuery);
    const distributorId = distributorResult.rows[0].distributorid;
    // Gọi hàm thông báo cho customer về việc đặt hàng thành công
    notificationUtils.createNotification(
      userId,
      "User",
      "Tạo đơn hàng mới",
      `Đơn hàng ${orderId.slice(0, 8)} đã được tạo thành công!`,
      "CreateNewOrder"
    );
    // Gọi hàm thông báo cho distributor về việc có đơn hàng mới
    notificationUtils.createNotification(
      distributorId,
      "Distributor",
      "Đơn hàng mới",
      `Đơn hàng ${orderId.slice(0, 8)} từ ${username} đã được tạo!`,
      "CreateNewOrder"
    );

    res.status(200).json({ url: session.url, paymentId });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to create payment session" });
  }
};

const getOrderDetails = async (orderId) => {
  const sqlOrderDetails = `
    SELECT 
      o.orderid, o.totalamount, o.ordercreatetime, o.estimatedelivery, o.shippingaddress, o.orderstatus,
      oi.productid, oi.quantityofitem,
      p.productname, p.productimage1, p.productsize,
      pb.unitofmeasure, pb.batchprice,
      pay.userid, pay.paymentmethod, pay.paymentstatus
    FROM "Order" o
    JOIN orderitem oi ON o.orderid = oi.orderid
    JOIN product p ON oi.productid = p.productid
    JOIN product_batch pb ON p.productid = pb.productid
    JOIN payment pay ON o.orderid = pay.orderid
    WHERE o.orderid = $1
  `;

  try {
    const result = await pool.query(sqlOrderDetails, [orderId]);
    if (result.rows.length === 0) {
      return { error: "Order not found" };
    }

    const order = {
      orderId: result.rows[0].orderid,
      totalAmount: result.rows[0].totalamount,
      orderCreateTime: result.rows[0].ordercreatetime,
      estimatedDelivery: result.rows[0].estimatedelivery,
      shippingAddress: result.rows[0].shippingaddress,
      orderStatus: result.rows[0].orderstatus,
      paymentMethod: result.rows[0].paymentmethod,
      paymentStatus: result.rows[0].paymentstatus,
      userId: result.rows[0].userid,
      items: result.rows.map((row) => ({
        productId: row.productid,
        productName: row.productname,
        productImage: row.productimage1,
        productSize: row.productsize,
        unitOfMeasure: row.unitofmeasure,
        batchPrice: row.batchprice,
        quantity: row.quantityofitem,
      })),
    };

    return order;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

const confirmPaymentSession = async (req, res) => {
  const sessionId = req.params.sessionId;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata.orderId;

    // Lấy chi tiết đơn hàng từ orderId
    const order = await getOrderDetails(orderId); // Giả sử bạn có hàm này để lấy chi tiết đơn hàng

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error confirming payment", error });
  }
};

const savePaymentToDB = async (req, res) => {
  const { userId, orderId, amount, paymentMethod, paymentStatus } = req.body;

  try {
    // Lưu thông tin thanh toán vào bảng "payment" (không cần paymentIntentId)
    const sqlPayment = `
      INSERT INTO payment 
      (orderid, userid, totalamount, paymentstatus, paymentcreatetime, paymentmethod, paymentupdatetime) 
      VALUES ($1, $2, $3, $4, NOW(), $5, NOW()) RETURNING paymentid`;

    // const paymentStatus = "Đã thanh toán"; // Trạng thái thanh toán thành công từ Stripe
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

    res.status(200).json({ message: "Đơn hàng được tạo thành công" });
  } catch (error) {
    console.error("Error saving payment info:", error);
    res.status(500).json({ error: "Failed to save payment info" });
  }
};

const getAllOrderToDistributor = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize, 10);

  try {
    // Lấy tổng số đơn hàng
    const totalOrdersResult = await pool.query('SELECT COUNT(*) FROM "Order"');
    const totalOrders = parseInt(totalOrdersResult.rows[0].count, 10);

    // Lấy danh sách đơn hàng cùng thông tin chi tiết
    const ordersQuery = `
      SELECT o.*, u.fullname AS user_fullname, o.shipperid
      FROM "Order" o
      JOIN "User" u ON o.userid = u.userid
      ORDER BY o.orderupdatetime DESC
      LIMIT $1 OFFSET $2
    `;
    const ordersResult = await pool.query(ordersQuery, [limit, offset]);
    const orders = ordersResult.rows;

    // Lấy thông tin shipper cho từng order
    for (let order of orders) {
      if (order.shipperid) {
        const shipperQuery = `
          SELECT fullname 
          FROM "User" 
          WHERE userid = $1 AND role = 'shipper'
        `;
        const shipperResult = await pool.query(shipperQuery, [order.shipperid]);
        order.shipper_fullname =
          shipperResult.rows[0]?.fullname || "No assigned shipper";
      } else {
        order.shipper_fullname = "No assigned shipper";
      }
    }

    res.json({
      orders,
      pagination: {
        totalOrders,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Distributor - Cập nhật trạng thái đơn hàng
const updateStatusByDistributor = async (req, res) => {
  const { orderId, status } = req.body;
  const currentTime = new Date();

  // Danh sách trạng thái hợp lệ
  const validStatuses = ["Đã xác nhận", "Đang giao hàng", "Đã hủy", "Hoàn tất"];

  // Kiểm tra xem status mới có hợp lệ không
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Trạng thái đơn hàng không hợp lệ" });
  }

  try {
    // Lấy trạng thái hiện tại của đơn hàng
    const orderQuery = `SELECT orderstatus FROM "Order" WHERE orderid = $1`;
    const orderResult = await pool.query(orderQuery, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Đơn hàng không tồn tại" });
    }

    const currentStatus = orderResult.rows[0].orderstatus;

    // Kiểm tra trạng thái chuyển tiếp hợp lệ
    const validTransitions = {
      "Đã tạo": ["Đã xác nhận", "Đã hủy"],
      "Đã xác nhận": ["Đang giao hàng", "Đã hủy"],
      "Đang giao hàng": ["Hoàn tất", "Đã hủy"],
      "Hoàn tất": [],
      "Đã hủy": [],
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        error: "Không thể chuyển sang trạng thái này từ trạng thái hiện tại",
      });
    }

    // Cập nhật trạng thái đơn hàng
    const sql = `UPDATE "Order" SET orderstatus = $1, orderupdatetime = $2 WHERE orderid = $3`;
    await pool.query(sql, [status, currentTime, orderId]);

    // Nếu trạng thái đơn hàng là "Hoàn tất", cập nhật trạng thái thanh toán trong bảng payment
    // Nếu trạng thái đơn hàng là "Hoàn tất", cập nhật trạng thái thanh toán trong bảng payment
    if (status === "Hoàn tất") {
      const paymentUpdateQuery = `
        UPDATE payment 
        SET paymentstatus = 'Đã thanh toán', paymentupdatetime = $1 
        WHERE orderid = $2
      `;
      await pool.query(paymentUpdateQuery, [currentTime, orderId]);
    }

    // Gửi thông báo cho user về việc cập nhật trạng thái đơn hàng
    const orderDetails = await getOrderDetails(orderId);
    notificationUtils.createNotification(
      orderDetails.userId,
      "User",
      "Cập nhật đơn hàng",
      `Đơn hàng ${orderId.slice(0, 8)} đã được cập nhật "${status}"`,
      "UpdateOrderStatus"
    );

    res.json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      updateTime: currentTime,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Customer - Hủy đơn hàng
const cancelOrderByCustomer = async (req, res) => {
  const { orderId } = req.body;
  const currentTime = new Date();

  try {
    // Lấy trạng thái hiện tại của đơn hàng
    const orderQuery = `SELECT orderstatus FROM "Order" WHERE orderid = $1`;
    const orderResult = await pool.query(orderQuery, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Đơn hàng không tồn tại" });
    }

    const currentStatus = orderResult.rows[0].orderstatus;

    // Kiểm tra trạng thái hiện tại
    if (currentStatus !== "Đã tạo") {
      return res.status(400).json({
        error: "Chỉ có thể hủy đơn hàng khi đơn hàng ở trạng thái 'Đã tạo'",
      });
    }

    // Cập nhật trạng thái đơn hàng thành "Đã hủy"
    const sql = `UPDATE "Order" SET orderstatus = $1, orderupdatetime = $2 WHERE orderid = $3`;
    await pool.query(sql, ["Đã hủy", currentTime, orderId]);

    res.json({
      message: "Hủy đơn hàng thành công",
      updateTime: currentTime,
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Lấy shipper trong khu vực
const getAllShipperOfDeliveryarea = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    // Lấy địa chỉ giao hàng
    const shippingAddressResult = await pool.query(
      'SELECT shippingaddress FROM "Order" WHERE orderid = $1',
      [orderId]
    );

    const shippingAddress = shippingAddressResult.rows[0]?.shippingaddress;

    // Tìm khu vực giao hàng từ địa chỉ
    const deliveryArea = shippingAddress.match(/Quận\s+\d+/);
    if (!deliveryArea) {
      return res.status(400).json({ message: "Khu vực không hợp lệ" });
    }

    let areaConditions;
    const area = deliveryArea[0]; // lấy chuỗi khu vực như "Quận 2"

    // Xác định khu vực dựa trên input của người dùng
    if (
      [
        "Quận 1",
        "Quận 2",
        "Quận 3",
        "Quận 5",
        "Quận 10",
        "Quận 4",
        "Quận Phú Nhuận",
        "Quận Bình Thạnh",
      ].includes(area)
    ) {
      areaConditions = "Khu vực 1";
    } else if (
      [
        "Quận 8",
        "Quận Tân Bình",
        "Quận Tân Phú",
        "Quận Gò Vấp",
        "Quận 11",
        "Quận 7",
      ].includes(area)
    ) {
      areaConditions = "Khu vực 2";
    } else if (
      [
        "Thủ Đức",
        "Quận 9",
        "Quận 12",
        "Củ Chi",
        "Hóc Môn",
        "Quận Bình Chánh",
        "Cần Giờ",
        "Nhà Bè",
      ].includes(area)
    ) {
      areaConditions = "Khu vực 3";
    } else {
      return res.status(400).json({ message: "Khu vực không hợp lệ" });
    }

    // Lấy tất cả shipper với điều kiện role, shipperstatus và deliveryarea
    const shippersResult = await pool.query(
      `SELECT * FROM "User" WHERE role = 'shipper' AND shipperstatus = 'Đang chờ' AND deliveryarea = $1`,
      [areaConditions]
    );

    // Kiểm tra xem có shipper nào không
    if (shippersResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy shipper cho khu vực này." });
    }

    // Trả về danh sách shipper
    return res.status(200).json({ shippers: shippersResult.rows });
  } catch (error) {
    console.error("Error fetching shippers:", error);
    return res.status(500).json({ message: "Lỗi khi lấy danh sách shipper" });
  }
};

// Cập nhật shipper for order
const updateShipperForOrder = async (req, res) => {
  const { orderId, shipperId } = req.body;
  const currentTime = new Date();
  const sql = `UPDATE "Order" SET shipperid = $1, orderupdatetime = $2 WHERE orderid = $3`;

  try {
    // Thực hiện truy vấn cập nhật shipper cho đơn hàng
    await pool.query(sql, [shipperId, currentTime, orderId]);

    res.json({
      message: "Cập nhật shipper cho đơn hàng thành công",
      updateTime: currentTime,
    });
  } catch (error) {
    console.error("Error updating shipper for order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Shipper - Lấy danh sách đơn hàng của mình
const getAllOrderToShipper = async (req, res) => {
  const { shipperid } = req.params; // Lấy shipperid từ URL params
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize, 10);

  try {
    // Đếm tổng số đơn hàng của shipper này
    const totalOrdersResult = await pool.query(
      'SELECT COUNT(*) FROM "Order" WHERE shipperid = $1',
      [shipperid]
    );
    const totalOrders = parseInt(totalOrdersResult.rows[0].count, 10);

    // Truy vấn danh sách đơn hàng theo shipperid
    const ordersQuery = `
      SELECT o.*, u.fullname AS customer_name, u.phonenumber
      FROM "Order" o
      JOIN "User" u ON o.userid = u.userid
      WHERE o.shipperid = $1
      ORDER BY o.orderupdatetime DESC
      LIMIT $2 OFFSET $3
    `;
    const ordersResult = await pool.query(ordersQuery, [
      shipperid,
      limit,
      offset,
    ]);

    res.json({
      orders: ordersResult.rows,
      pagination: {
        totalOrders,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders for shipper:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrderDetailShipper = async (req, res) => {
  const { orderIdDetail } = req.params; // Lấy orderIdDetail từ URL params

  try {
    // Truy vấn chi tiết đơn hàng và thông tin khách hàng
    const orderDetailQuery = `
      SELECT 
        o.orderid, 
        o.shippingaddress, 
        o.totalamount, 
        o.orderstatus, 
        o.ordercreatetime, 
        o.orderupdatetime,
        u.fullname AS customer_name, 
        u.phonenumber AS customer_phone
      FROM "Order" o
      JOIN "User" u ON o.userid = u.userid
      WHERE o.orderid = $1
    `;

    const orderDetailResult = await pool.query(orderDetailQuery, [
      orderIdDetail,
    ]);

    // Kiểm tra xem đơn hàng có tồn tại không
    if (orderDetailResult.rows.length === 0) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Trả về thông tin chi tiết đơn hàng
    res.json(orderDetailResult.rows[0]);
  } catch (error) {
    console.error("Error fetching order detail:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
  createPaymentSession,
  getOrderDetails,
  confirmPaymentSession,
  savePaymentToDB,
  getAllOrderToDistributor,
  updateStatusByDistributor,
  cancelOrderByCustomer,
  getAllShipperOfDeliveryarea,
  updateShipperForOrder,
  getAllOrderToShipper,
  getOrderDetailShipper,
};
