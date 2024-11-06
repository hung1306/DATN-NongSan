const pool = require("../config/dbConnect");
const bcrypt = require("bcryptjs");

const { storage } = require("../config/firebase");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
// Cấu hình Multer để xử lý upload
const upload = multer({
  storage: multer.memoryStorage(),
});

// lay thong tin user tu userId
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query(`SELECT * FROM "User" WHERE userid = $1`, [
      id,
    ]);
    res.json(user.rows[0]);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  try {
    const user = await pool.query(`SELECT * FROM "User" WHERE userid = $1`, [
      userId,
    ]);
    //hash password
    const validPassword = await bcrypt.compare(
      oldPassword,
      user.rows[0].password
    );
    if (!validPassword) {
      return res.status(400).send("Mật khẩu cũ không chính xác");
    }
    if (oldPassword === newPassword) {
      return res
        .status(400)
        .send("Mật khẩu mới không được tùng với mật khẩu cũ");
    }
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await pool.query(`UPDATE "User" SET password = $1 WHERE userid = $2`, [
      newHashedPassword,
      userId,
    ]);
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const changeInfo = async (req, res) => {
  const {
    userId,
    username,
    email,
    fullname,
    street,
    commune,
    district,
    province,
    phonenumber,
    indentitycard,
    dob,
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE "User" SET username = $1, email = $2, fullname = $3, street = $4, commune = $5, district = $6, province = $7, phonenumber = $8, indentitycard = $9, dob = $10 WHERE userid = $11`,
      [
        username,
        email,
        fullname,
        street,
        commune,
        district,
        province,
        phonenumber,
        indentitycard,
        dob,
        userId,
      ]
    );
    res.json({
      message: "Cập nhật thông tin thành công",
      result: result.rows[0],
    });
  } catch (error) {
    console.error("Error changing info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateAvatarFarm = async (req, res) => {
  const { userId } = req.params;
  try {
    const avatar = req.file;
    let avatarUrl = null;
    if (avatar) {
      const avatarBuffer = avatar.buffer;
      const avatarFilename = `avatars/${uuidv4()}`;
      const avatarRef = ref(storage, avatarFilename);

      await uploadBytes(avatarRef, avatarBuffer, {
        contentType: avatar.mimetype,
      });
      avatarUrl = await getDownloadURL(avatarRef);

      const newAvatar = await pool.query(
        `UPDATE "User" SET avatar = $1 WHERE userid = $2 RETURNING *`,
        [avatarUrl, userId]
      );
      res.json({
        message: "Avatar đã được cập nhật thành công",
        data: newAvatar.rows[0],
      });
    }
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const changeAvatarCustomer = async (req, res) => {
  const { userId } = req.params;
  try {
    const avatar = req.file;
    let avatarUrl = null;

    if (avatar) {
      const avatarBuffer = avatar.buffer;
      const avatarFilename = `avatars/${uuidv4()}`;
      const avatarRef = ref(storage, avatarFilename);

      await uploadBytes(avatarRef, avatarBuffer, {
        contentType: avatar.mimetype,
      });
      avatarUrl = await getDownloadURL(avatarRef);
    } else {
      // Lấy avatar hiện tại từ cơ sở dữ liệu nếu không có avatar mới
      const currentAvatarQuery = await pool.query(
        `SELECT avatar FROM "User" WHERE userid = $1`,
        [userId]
      );
      avatarUrl = currentAvatarQuery.rows[0].avatar;
    }

    const newAvatar = await pool.query(
      `UPDATE "User" SET avatar = $1 WHERE userid = $2 RETURNING *`,
      [avatarUrl, userId]
    );

    res.json({
      message: "Avatar đã được cập nhật thành công",
      data: newAvatar.rows[0],
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllFarmer = async (req, res) => {
  try {
    // Lấy page và limit từ query parameters, mặc định là page 1 và limit 10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Lấy tất cả farmer có status = false và thông tin trang trại của họ với phân trang
    const result = await pool.query(
      `
      SELECT u.*, f.farmname
      FROM "User" u
      LEFT JOIN farm f ON u.userid = f.userid
      WHERE u.role = 'farmer'
      ORDER BY u.status ASC, u.userid
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    );
    const farmersWithFarms = result.rows;

    // Lấy tổng số lượng farmer để tính tổng số trang
    const countResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM "User" u
      WHERE u.role = 'farmer'
    `);
    const totalFarmers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalFarmers / limit);

    res.json({
      farmersWithFarms,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getFarmerDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT u.*, f.*
      FROM "User" u
      LEFT JOIN farm f ON u.userid = f.userid
      WHERE u.userid = $1
    `,
      [userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching farmer details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateFarmerStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      `
      UPDATE "User"
      SET status = $1
      WHERE userid = $2
      RETURNING *
    `,
      [status, userId]
    );

    // Sử dụng res.status(200).json(obj) để trả về phản hồi
    res.status(200).json({
      data: result.rows[0],
      message: "Cập nhật trạng thái nông dân thành công",
    });
  } catch (error) {
    console.error("Error updating farmer status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateShipperRegisterStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      `
      UPDATE "User"
      SET status = $1
      WHERE userid = $2
      RETURNING *
    `,
      [status, userId]
    );

    res.status(200).json({
      data: result.rows[0],
      message: "Cập nhật trạng thái người giao hàng thành công",
    });
  } catch (error) {
    console.error("Error updating farmer status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateShipperStatus = async (req, res) => {
  const { userId } = req.params;
  const { shipperstatus } = req.body;
  try {
    const result = await pool.query(
      `
      UPDATE "User"
      SET shipperstatus = $1
      WHERE userid = $2
      RETURNING *
    `,
      [shipperstatus, userId]
    );

    res.status(200).json({
      data: result.rows[0],
      message: "Cập nhật trạng thái người giao hàng thành công",
    });
  } catch (error) {
    console.error("Error updating farmer status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllShippers = async (req, res) => {
  try {
    // Lấy page và limit từ query parameters, mặc định là page 1 và limit 10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Lấy tất cả shipper từ bảng "User" với phân trang
    const result = await pool.query(
      `
      SELECT *
      FROM "User"
      WHERE role = 'shipper'
      ORDER BY status ASC, userid
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    );
    const shippers = result.rows;

    // Lấy tổng số lượng shipper để tính tổng số trang
    const countResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM "User"
      WHERE role = 'shipper'
    `);
    const totalShippers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalShippers / limit);

    res.json({
      shippers,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching shippers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getShipperDetail = async (req, res) => {
  try {
    const { userid } = req.params;

    // Truy vấn để lấy thông tin chi tiết của shipper với userid
    const result = await pool.query(
      `
      SELECT *
      FROM "User"
      WHERE userid = $1 AND role = 'shipper'
    `,
      [userid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy shipper" });
    }

    const shipperDetail = result.rows[0];

    res.json(shipperDetail);
  } catch (error) {
    console.error("Error fetching shipper details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getUserById,
  changePassword,
  changeInfo,
  upload,
  updateAvatarFarm,
  changeAvatarCustomer,
  getAllFarmer,
  getFarmerDetails,
  updateFarmerStatus,
  updateShipperStatus,
  getAllShippers,
  getShipperDetail,
  updateShipperRegisterStatus,
};
