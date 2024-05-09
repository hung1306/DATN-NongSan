require("dotenv").config();
const pool = require("../config/dbConnect");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerFarmerStep1 = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      fullname,
      phonenumber,
      address,
      dob,
      role,
      status,
    } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Lưu thông tin cơ bản vào cơ sở dữ liệu
    const newUser = await pool.query(
      'INSERT INTO "User" (username, password, email, fullname, phonenumber, address, dob, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        username,
        hashedPassword,
        email,
        fullname,
        phonenumber,
        address,
        dob,
        role,
        status,
      ]
    );

    res.json(newUser.rows[0]);
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Internal Server Error");
  }
};

const registerFarmerStep2 = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      farmName,
      farmType,
      contactName,
      idNumber,
      farmArea,
      farmDescription,
    } = req.body;

    // Kiểm tra xem các thông tin bắt buộc đã được gửi lên từ client chưa
    if (
      !farmName ||
      !farmType ||
      !contactName ||
      !idNumber ||
      !farmArea ||
      !farmDescription
    ) {
      return res.status(400).send("Vui lòng nhập đầy đủ thông tin.");
    }

    // Tiến hành cập nhật thông tin trang trại vào cơ sở dữ liệu
    const newFarm = await pool.query(
      "INSERT INTO Farm (farmname, farmtype, contactname, identitycard, farmarea, farmdes, userid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        farmName,
        farmType,
        contactName,
        idNumber,
        farmArea,
        farmDescription,
        userId,
      ]
    );

    res.json(newFarm.rows[0]);
  } catch (error) {
    console.error("Error updating additional info:", error);
    res.status(500).send("Internal Server Error");
  }
};

const registerFarmerStep3 = async (req, res) => {};

module.exports = {
  registerFarmerStep1,
  registerFarmerStep2,
  registerFarmerStep3,
};
