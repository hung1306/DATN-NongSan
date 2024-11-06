const moment = require("moment");
const pool = require("../config/dbConnect");
const createNotification = require("./notificationsUtils");

exports.autoUpdateProductBatch = async (req, res) => {
  try {
    const today = moment();

    // Fetch all batches with their standard expiry information
    const { rows: batches } = await pool.query(`
      SELECT b.batchid, b.expirydate, b.batchquality, b.promotion, c.standardexpiry
      FROM product_batch b
      JOIN product p ON b.productid = p.productid
      JOIN category c ON p.categoryid = c.categoryid
    `);

    const updatePromises = batches.map(async (batch) => {
      const expiryDate = moment(batch.expirydate);
      const daysUntilExpiry = expiryDate.diff(today, "days");
      const standardExpiry = batch.standardexpiry;

      let newQuality = batch.batchquality;
      let newPromotion = batch.promotion;

      // Adjust logic based on standard expiry
      if (daysUntilExpiry > standardExpiry * 0.5) {
        newQuality = "Mới thu hoạch";
        newPromotion = 0;
      } else if (daysUntilExpiry > standardExpiry * 0.25) {
        newQuality = "Tươi";
        newPromotion = 10;
      } else if (daysUntilExpiry > standardExpiry * 0.1) {
        newQuality = "Bình thường";
        newPromotion = 25;
      } else if (daysUntilExpiry > 0) {
        newQuality = "Sắp hết hạn";
        newPromotion = 50;
      } else {
        newQuality = "Hết hạn";
        newPromotion = 70;
      }

      // Update if quality or promotion changes
      if (
        newQuality !== batch.batchquality ||
        newPromotion !== batch.promotion
      ) {
        await pool.query(
          "UPDATE product_batch SET batchquality = $1, promotion = $2 WHERE batchid = $3",
          [newQuality, newPromotion, batch.batchid]
        );
      }

      // Update visibility and send notification if expired
      if (daysUntilExpiry <= 0 || batch.bachquantity === 0) {
        await pool.query(
          "UPDATE product_batch SET isvisible = false WHERE batchid = $1",
          [batch.batchid]
        );

        const notificationMessage = `Lô hàng có mã ${batch.batchid.slice(
          0,
          8
        )} đã quá hạn`;
        const { rows: notifications } = await pool.query(
          "SELECT * FROM notifications WHERE message = $1",
          [notificationMessage]
        );

        if (notifications.length === 0) {
          const { rows: distributors } = await pool.query(
            "SELECT distributorid FROM distributor LIMIT 1"
          );
          const distributorId = distributors[0].distributorid;

          createNotification.createNotification(
            distributorId,
            "Distributor",
            "Lô hàng hết hạn",
            notificationMessage,
            "BatchExpired"
          );
        }
      }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    console.log("Product batches updated successfully👌");
  } catch (error) {
    console.error("Error updating product batch:", error);
  }
};

exports.autoHideExpiredProductBatch = async (req, res) => {
  try {
    const today = moment();

    // Fetch all batches
    const { rows: batches } = await pool.query(`
      SELECT batchid, expirydate
      FROM product_batch
    `);

    const updatePromises = batches.map(async (batch) => {
      const expiryDate = moment(batch.expirydate);
      const daysUntilExpiry = expiryDate.diff(today, "days");

      if (daysUntilExpiry <= 0) {
        await pool.query(
          "UPDATE product_batch SET isvisible = false WHERE batchid = $1",
          [batch.batchid]
        );
      }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    console.log("Expired product batches hidden successfully👌");
  } catch (error) {
    console.error("Error hiding expired product batch:", error);
  }
};
