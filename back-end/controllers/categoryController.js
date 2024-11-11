const pool = require("../config/dbConnect");

const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { storage } = require("../config/firebase");

// Cấu hình Multer để xử lý upload
const upload = multer({
  storage: multer.memoryStorage(),
});
exports.upload = upload;

// Đã dùng để gọi tất cả các category trên trang chủ
exports.getCategories = async (req, res) => {
  try {
    const categories = await pool.query("SELECT * FROM category");
    res.json(categories.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await pool.query(
      "SELECT * FROM category WHERE categoryid = $1",
      [id]
    );
    res.json(category.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM category WHERE categoryid = $1", [id]);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createCategoryforDistributor = async (req, res) => {
  try {
    const { categoryname, categorydes, standardexpiry } = req.body;
    const categoryimage = req.file;

    let categoryimageUrl = null;
    if (categoryimage) {
      const categoryimageBuffer = categoryimage.buffer;
      const categoryimageFileName = `categories/${uuidv4()}`;
      const categoryimageRef = ref(storage, categoryimageFileName);

      await uploadBytes(categoryimageRef, categoryimageBuffer, {
        contentType: categoryimage.mimetype,
      });
      categoryimageUrl = await getDownloadURL(categoryimageRef);
    }

    // Tạo một category mới
    const newCategory = await pool.query(
      `INSERT INTO category (categoryname, categorydes, categoryimage, standardexpiry) VALUES ($1, $2, $3, $4) RETURNING *`,
      [categoryname, categorydes, categoryimageUrl, standardexpiry]
    );

    // Trả về phản hồi thành công
    res.json({
      category: newCategory.rows[0],
      message: "Tạo danh mục thành công",
    });
  } catch (error) {
    console.error("Lỗi khi tạo danh mục:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi tạo danh mục" });
  }
};

exports.updateCategoryforDistributor = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryname, categorydes, standardexpiry } = req.body;
    const categoryimage = req.file;
    // Kiểm tra xem có category nào tồn tại hay không
    const categoryResult = await pool.query(
      `SELECT * FROM category WHERE categoryid = $1`,
      [id]
    );
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ message: "Danh mục không tồn tại" });
    }
    existingCategory = categoryResult.rows[0];
    let categoryimageUrl = null;
    const uploadImage = async (image) => {
      if (!image) return null;
      const imageBuffer = image.buffer;
      const imageFileName = `categories/${uuidv4()}`;
      const imageRef = ref(storage, imageFileName);

      await uploadBytes(imageRef, imageBuffer, { contentType: image.mimetype });
      return await getDownloadURL(imageRef);
    };
    categoryimageUrl = categoryimage
      ? await uploadImage(categoryimage, categoryname)
      : existingCategory.categoryimage;
    // Cập nhật category
    const updatedCategory = await pool.query(
      `UPDATE category SET categoryname = $1, categorydes = $2, categoryimage = $3, standardexpiry = $4 WHERE categoryid = $5 RETURNING *`,
      [categoryname, categorydes, categoryimageUrl, standardexpiry, id]
    );

    // Kiểm tra xem category có tồn tại hay không
    if (updatedCategory.rows.length === 0) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    // Trả về phản hồi thành công
    res.json({
      category: updatedCategory.rows[0],
      message: "Cập nhật danh mục thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi cập nhật danh mục" });
  }
};

exports.getAllCategory = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize, 10);

  try {
    // Lấy tổng số danh mục
    const totalResult = await pool.query(`SELECT COUNT(*) FROM category`);
    const totalCategories = parseInt(totalResult.rows[0].count, 10);

    // Lấy danh mục với phân trang
    const result = await pool.query(
      `SELECT * FROM category
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Nếu không có danh mục nào thì trả về thông báo
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy danh mục nào" });
    }

    // Trả về danh sách danh mục cùng với thông tin phân trang
    res.json({
      categories: result.rows,
      pagination: {
        totalCategories,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalPages: Math.ceil(totalCategories / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy số lượng sản phẩm theo userid của từng danh mục
exports.getCategoryCountByFarmerId = async (req, res) => {
  try {
    const { userid } = req.params; // Lấy userid từ req.params
    if (!userid) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Từ user id lấy farm id
    const farmResult = await pool.query(
      `SELECT * FROM farm WHERE userid = $1`,
      [userid]
    );

    if (farmResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Farm not found for this user ID" });
    }

    const farmid = farmResult.rows[0].farmid;

    const categorySalesResult = await pool.query(
      `SELECT category.categoryname, COUNT(product.productid) as quantity
        FROM product
        JOIN category ON product.categoryid = category.categoryid
        WHERE product.farmid = $1
        GROUP BY category.categoryname`,
      [farmid]
    );

    res.json(categorySalesResult.rows);
  } catch (error) {
    console.error("Error fetching category count by farmer ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy số lượng sản phẩm theo từng danh mục
exports.getCategoryCount = async (req, res) => {
  try {
    const categorySalesResult = await pool.query(
      `SELECT category.categoryname, COUNT(product.productid) as quantity
        FROM product
        JOIN category ON product.categoryid = category.categoryid
        GROUP BY category.categoryname`
    );

    res.json(categorySalesResult.rows );
  } catch (error) {
    console.error("Error fetching category count:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}