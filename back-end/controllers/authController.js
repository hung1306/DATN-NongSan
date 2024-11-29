require("dotenv").config();
const pool = require("../config/dbConnect");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const { storage } = require("../config/firebase");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const notificationUtils = require("../utils/notificationsUtils");
const validate = require("../validator/authValidator");
// Cấu hình Multer để xử lý upload
const upload = multer({
  storage: multer.memoryStorage(),
});

// Đăng ký tài khoản b1
const registerStep1 = async (req, res) => {
  try {
    const { username, password, email, fullname, phonenumber, role, status } =
      req.body;

    // Validate required fields
    const usernameError = validate.validateUsername(username);
    if (usernameError) return res.status(400).send(usernameError);

    const passwordError = validate.validatePassword(password);
    if (passwordError) return res.status(400).send(passwordError);

    const emailError = validate.validateEmail(email);
    if (emailError) return res.status(400).send(emailError);

    const fullnameError = validate.validateFullname(fullname);
    if (fullnameError) return res.status(400).send(fullnameError);

    const phonenumberError = validate.validatePhonenumber(phonenumber);
    if (phonenumberError) return res.status(400).send(phonenumberError);

    if (!role || !status) {
      return res.status(400).send("Các trường không được để trống");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const existingUsername = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );
    if (existingUsername.rows.length > 0) {
      return res.status(400).send("Tên đăng nhập đã tồn tại!");
    }
    const existingEmail = await pool.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(400).send("Email đã tồn tại!");
    }
    const existingFullname = await pool.query(
      'SELECT * FROM "User" WHERE fullname = $1',
      [fullname]
    );
    if (existingFullname.rows.length > 0) {
      return res.status(400).send("Họ và tên đã tồn tại!");
    }

    // Check for existing phonenumber
    const existingPhonenumber = await pool.query(
      'SELECT * FROM "User" WHERE phonenumber = $1',
      [phonenumber]
    );
    if (existingPhonenumber.rows.length > 0) {
      return res.status(400).send("Số điện thoại đã tồn tại!");
    }

    // Insert new user
    const newUser = await pool.query(
      'INSERT INTO "User" (username, password, email, fullname, phonenumber, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [username, hashedPassword, email, fullname, phonenumber, role, status]
    );

    res.json(newUser.rows[0]);
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Đăng ký tài khoản b2
const registerStep2 = async (req, res) => {
  try {
    const { userId } = req.params;
    const { address, indentityCard, dateOfBirth, status } = req.body;
    const avatar = req.file;

    // Kiểm tra tính hợp lệ của địa chỉ
    if (!address) {
      return res.status(400).send("Địa chỉ không được gửi.");
    }
    const parsedAddress = JSON.parse(address);
    const { street, commune, district, province } = parsedAddress;

    if (!street) {
      return res.status(400).send("Đường không được để trống.");
    }
    if (!commune) {
      return res.status(400).send("Xã/Phường không được để trống.");
    }
    if (!district) {
      return res.status(400).send("Quận/Huyện không được để trống.");
    }
    if (!province) {
      return res.status(400).send("Tỉnh/Thành phố không được để trống.");
    }

    // Kiểm tra tính hợp lệ của các trường khác
    if (!indentityCard) {
      return res.status(400).send("Số CMND không được để trống.");
    }
    if (!dateOfBirth) {
      return res.status(400).send("Ngày sinh không được để trống.");
    }
    let avatarUrl = null;
    if (avatar) {
      const avatarBuffer = avatar.buffer;
      const avatarFileName = `avatars/${uuidv4()}`;
      const avatarRef = ref(storage, avatarFileName);

      await uploadBytes(avatarRef, avatarBuffer, {
        contentType: avatar.mimetype,
      });
      avatarUrl = await getDownloadURL(avatarRef);
    }
    // Cập nhật thông tin người dùng trong PostgreSQL
    const updatedUser = await pool.query(
      'UPDATE "User" SET street = $1, commune = $2, district = $3, province = $4, indentitycard = $5, dob = $6, avatar = $7, status = $8 WHERE userid = $9 RETURNING *',
      [
        street,
        commune,
        district,
        province,
        indentityCard,
        dateOfBirth,
        avatarUrl,
        status,
        userId,
      ]
    );

    // Trả về kết quả
    res.json({ message: "Đăng ký thành công", user: updatedUser.rows[0] });
  } catch (error) {
    console.error("Error updating additional info:", error);
    res.status(500).send("Internal Server Error");
  }
};

const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    const user = await pool.query(
      'SELECT * FROM "User" WHERE UserName = $1 OR Email = $1',
      [usernameOrEmail]
    );

    if (user.rows.length === 0) {
      return res.status(400).send("Tên đăng nhập hoặc email không tồn tại");
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).send("Mật khẩu không chính xác");
    }

    // Kiểm tra trạng thái tài khoản
    if (user.rows[0].status === false) {
      return res
        .status(400)
        .send("Tài khoản chưa được kích hoạt hoặc đã bị khóa");
    }
    // Generate access token and refresh token
    const accessToken = generateAccessToken(
      user.rows[0].userid,
      user.rows[0].username,
      user.rows[0].fullname,
      user.rows[0].role,
      user.rows[0].avatar
    );
    const refreshToken = generateRefreshToken(user.rows[0].username);

    // Store refresh token in the database
    await pool.query('UPDATE "User" SET refreshToken = $1 WHERE userid = $2', [
      refreshToken,
      user.rows[0].userid,
    ]);

    res
      .header("auth-token", accessToken)
      .json({ accessToken, refreshToken, avatar: user.rows[0].avatar });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).send("Internal Server Error");
  }
};

const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).send("Refresh Token is required");

  try {
    const user = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(user.username);
    res.json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi refresh token:", error);
    res.status(403).send("Invalid Refresh Token");
  }
};

const logout = async (req, res) => {
  const { username } = req.body;
  try {
    await pool.query(
      'UPDATE "User" SET refreshtoken = null WHERE username = $1',
      [username]
    );

    // Vô hiệu hóa caching
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.send("Logged out successfully");
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    res.status(500).send("Internal Server Error");
  }
};

//farmer

const registerFarmerStep1 = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      fullname,
      phonenumber,
      indentitycard,
      dob,
      role,
      status,
      street,
      commune,
      district,
      province,
    } = req.body;
    const avatar = req.file;

    // Validate required fields
    const emailError = validate.validateEmail(email);
    if (emailError) return res.status(400).send(emailError);

    const usernameError = validate.validateUsername(username);
    if (usernameError) return res.status(400).send(usernameError);

    const passwordError = validate.validatePassword(password);
    if (passwordError) return res.status(400).send(passwordError);

    const fullnameError = validate.validateFullname(fullname);
    if (fullnameError) return res.status(400).send(fullnameError);

    const phonenumberError =validate. validatePhonenumber(phonenumber);
    if (phonenumberError) return res.status(400).send(phonenumberError);

    if (!role) return res.status(400).send("Vai trò không được để trống.");
    if (!status) return res.status(400).send("Trạng thái không được để trống.");

    if (!street) return res.status(400).send("Đường không được để trống.");
    if (!commune) return res.status(400).send("Xã/Phường không được để trống.");
    if (!district) return res.status(400).send("Quận/Huyện không được để trống.");
    if (!province) return res.status(400).send("Tỉnh/Thành phố không được để trống.");

    // Kiểm tra số CMND và ngày sinh
    if (!indentitycard) return res.status(400).send("Số CMND không được để trống.");
    if (!/^\d+$/.test(indentitycard)) return res.status(400).send("Số CMND phải là số.");

    if (!dob) return res.status(400).send("Ngày sinh không được để trống.");
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) return res.status(400).send("Ngày sinh phải có định dạng YYYY-MM-DD.");
    const date = new Date(dob);
    if (isNaN(date.getTime())) return res.status(400).send("Ngày sinh không hợp lệ.");

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check for existing username
    const existingUsername = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );
    if (existingUsername.rows.length > 0) {
      return res.status(400).send("Username đã tồn tại");
    }

    // Check for existing email
    const existingEmail = await pool.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(400).send("Email đã tồn tại, vui lòng chọn email khác");
    }

    // Check for existing fullname
    const existingFullname = await pool.query(
      'SELECT * FROM "User" WHERE fullname = $1',
      [fullname]
    );
    if (existingFullname.rows.length > 0) {
      return res.status(400).send("Họ và tên đã tồn tại, vui lòng chọn họ và tên khác");
    }

    // Check for existing phonenumber
    const existingPhonenumber = await pool.query(
      'SELECT * FROM "User" WHERE phonenumber = $1',
      [phonenumber]
    );
    if (existingPhonenumber.rows.length > 0) {
      return res.status(400).send("Số điện thoại đã tồn tại, vui lòng chọn số điện thoại khác");
    }

    let avatarUrl = null;
    if (avatar) {
      const avatarBuffer = avatar.buffer;
      const avatarFileName = `avatars/${uuidv4()}`;
      const avatarRef = ref(storage, avatarFileName);

      await uploadBytes(avatarRef, avatarBuffer, {
        contentType: avatar.mimetype,
      });
      avatarUrl = await getDownloadURL(avatarRef);
    }

    // Lưu thông tin cơ bản vào cơ sở dữ liệu
    const newUser = await pool.query(
      'INSERT INTO "User" (username, password, email, fullname, phonenumber, indentitycard, dob, role, status, street, commune, district, province, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
      [
        username,
        hashedPassword,
        email,
        fullname,
        phonenumber,
        indentitycard,
        dob,
        role,
        status,
        street,
        commune,
        district,
        province,
        avatarUrl,
      ]
    );

    res.json(newUser.rows[0]);
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Internal Server Error");
  }
};


const registerFarmerStep2 = async (req, res) => {
  const { userId } = req.params;
  const {
    farmname,
    farmtype,
    farmemail,
    farmstreet,
    farmcommune,
    farmdistrict,
    farmprovince,
    farmarea,
    farmdescription,
    farmphone,
    farmproductstotal,
    farmservice,
    farminvite,
  } = req.body;

  // Kiểm tra xem các thông tin bắt buộc đã được gửi lên từ client chưa
  if (!farmname) return res.status(400).send("Tên trang trại không được để trống.");
  if (!farmtype) return res.status(400).send("Loại trang trại không được để trống.");
  if (!farmemail) return res.status(400).send("Email trang trại không được để trống.");
  if (!farmarea) return res.status(400).send("Diện tích trang trại không được để trống.");
  if (!farmdescription) return res.status(400).send("Mô tả trang trại không được để trống.");
  if (!farmphone) return res.status(400).send("Số điện thoại trang trại không được để trống.");
  if (!farmproductstotal) return res.status(400).send("Tổng sản phẩm trang trại không được để trống.");
  if (!farmservice) return res.status(400).send("Dịch vụ trang trại không được để trống.");
  if (!farminvite) return res.status(400).send("Lời mời trang trại không được để trống.");

  if (!farmstreet) return res.status(400).send("Đường không được để trống.");
  if (!farmcommune) return res.status(400).send("Xã/Phường không được để trống.");
  if (!farmdistrict) return res.status(400).send("Quận/Huyện không được để trống.");
  if (!farmprovince) return res.status(400).send("Tỉnh/Thành phố không được để trống.");

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(farmemail)) return res.status(400).send("Email trang trại không hợp lệ.");

  // Validate phone number format
  const phoneRegex = /^0[0-9]{9}$/;
  if (!phoneRegex.test(farmphone)) return res.status(400).send("Số điện thoại trang trại phải có 10 chữ số và bắt đầu bằng số 0.");

  try {
    const uploadImage = async (image) => {
      if (!image) return null;
      const imageBuffer = image.buffer;
      const imageFileName = `farms/${farmname}/${uuidv4()}`;
      const imageRef = ref(storage, imageFileName);

      await uploadBytes(imageRef, imageBuffer, { contentType: image.mimetype });
      return await getDownloadURL(imageRef);
    };

    const farmLogoUrl = await uploadImage(
      req.files.farmlogo ? req.files.farmlogo[0] : null
    );
    const farmImageUrl = await uploadImage(
      req.files.farmimage ? req.files.farmimage[0] : null
    );
    const farmImage1Url = await uploadImage(
      req.files.farmimage1 ? req.files.farmimage1[0] : null
    );
    const farmImage2Url = await uploadImage(
      req.files.farmimage2 ? req.files.farmimage2[0] : null
    );
    const farmImage3Url = await uploadImage(
      req.files.farmimage3 ? req.files.farmimage3[0] : null
    );

    // Tiến hành cập nhật thông tin trang trại vào cơ sở dữ liệu
    const newFarm = await pool.query(
      "INSERT INTO Farm (farmname, farmtype, farmemail, farmarea, farmdes, userid, farmstreet, farmcommune, farmdistrict, farmprovince, farmphone, farmproductstotal, farmservice, farminvite, farmlogo, farmimage, farmimage1, farmimage2, farmimage3) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *",
      [
        farmname,
        farmtype,
        farmemail,
        farmarea,
        farmdescription,
        userId,
        farmstreet,
        farmcommune,
        farmdistrict,
        farmprovince,
        farmphone,
        farmproductstotal,
        farmservice,
        farminvite,
        farmLogoUrl,
        farmImageUrl,
        farmImage1Url,
        farmImage2Url,
        farmImage3Url,
      ]
    );

    res.json({
      farm: newFarm.rows[0],
      message: "Đăng ký trang trại thành công",
    });
  } catch (error) {
    console.error("Error updating additional info:", error);
    res.status(500).send("Internal Server Error");
  }
};

const registerFarmerStep3 = async (req, res) => {
  const { userId } = req.params;
  try {
    //Lấy thông tin nhà phân phối
    const distributor = await pool.query(
      `SELECT distributorid FROM distributor`
    );

    // Lấy thông tin nông dân
    const farmer = await pool.query(
      `SELECT fullname FROM "User" WHERE userid = $1`,
      [userId]
    );
    const distributorid = distributor.rows[0];
    // Gọi hàm để gửi thông báo cho nhà phân phối
    notificationUtils.createNotification(
      distributorid.distributorid,
      "Distributor",
      "Đăng ký tài khoản nông dân mới",
      `Có nông dân ${farmer.rows[0].fullname} mới đăng ký tài khoản, hãy xét duyệt để nông dân hoàn tất thủ tục đăng ký`,
      "CreateNewFarmer"
    );
    // Trả về kết quả
    res.json({ message: "Đã gửi yêu cầu đăng ký thành công" });
  } catch (error) {
    console.error("Error updating additional info:", error);
    res.status(500).send("Internal Server Error");
  }
};

const loginDistributor = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    const distributor = await pool.query(
      "SELECT * FROM distributor WHERE username = $1 OR email = $1",
      [usernameOrEmail]
    );

    if (distributor.rows.length === 0) {
      return res.status(400).send("Tên đăng nhập hoặc email không tồn tại");
    }

    const validPassword = await bcrypt.compare(
      password,
      distributor.rows[0].password
    );
    if (!validPassword) {
      return res.status(400).send("Mật khẩu không chính xác");
    }

    // Đăng ký token
    const token = jwt.sign(
      { distributorid: distributor.rows[0].distributorid },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).send("Internal Server Error");
  }
};

const shipperRegister = async (req, res) => {
  try {
    // Bước 1: Lấy thông tin người dùng từ request body
    const {
      username,
      password,
      email,
      fullname,
      phonenumber,
      role,
      status,
      address,
      indentityCard,
      dob,
      shipperstatus,
      deliveryarea,
    } = req.body;
    const avatar = req.file;

    // Validate required fields
    const usernameError = validate.validateUsername(username);
    if (usernameError) return res.status(400).send(usernameError);

    const emailError = validate.validateEmail(email);
    if (emailError) return res.status(400).send(emailError);

    const passwordError = validate.validatePassword(password);
    if (passwordError) return res.status(400).send(passwordError);

    const fullnameError = validate.validateFullname(fullname);
    if (fullnameError) return res.status(400).send(fullnameError);

    const phonenumberError =validate. validatePhonenumber(phonenumber);
    if (phonenumberError) return res.status(400).send(phonenumberError);

    if (!role) return res.status(400).send("Vai trò không được để trống.");
    if (!status) return res.status(400).send("Trạng thái không được để trống.");
    if (!shipperstatus)
      return res
        .status(400)
        .send("Trạng thái người giao hàng không được để trống.");
    if (!deliveryarea)
      return res.status(400).send("Khu vực giao hàng không được để trống.");

    // Kiểm tra tính hợp lệ của địa chỉ
    let parsedAddress;
    try {
      parsedAddress = JSON.parse(address);
    } catch (error) {
      return res.status(400).send("Địa chỉ không hợp lệ.");
    }

    const { street, commune, district, province } = parsedAddress;

    if (!street) return res.status(400).send("Đường không được để trống.");
    if (!commune) return res.status(400).send("Xã/Phường không được để trống.");
    if (!district)
      return res.status(400).send("Quận/Huyện không được để trống.");
    if (!province)
      return res.status(400).send("Tỉnh/Thành phố không được để trống.");

    // Kiểm tra số CMND và ngày sinh
    if (!indentityCard)
      return res.status(400).send("Số CMND không được để trống.");
    if (!/^\d+$/.test(indentityCard))
      return res.status(400).send("Số CMND phải là số.");

    if (!dob) return res.status(400).send("Ngày sinh không được để trống.");
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob))
      return res.status(400).send("Ngày sinh phải có định dạng YYYY-MM-DD.");
    const date = new Date(dob);
    if (isNaN(date.getTime()))
      return res.status(400).send("Ngày sinh không hợp lệ.");

    // Mã hóa mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Kiểm tra username đã tồn tại
    const existingUsername = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );
    if (existingUsername.rows.length > 0) {
      return res.status(400).send("Username đã tồn tại");
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await pool.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(400).send("Email đã tồn tại, vui lòng chọn email khác");
    }

    // Kiểm tra số điện thoại đã tồn tại
    const existingPhonenumber = await pool.query(
      'SELECT * FROM "User" WHERE phonenumber = $1',
      [phonenumber]
    );
    if (existingPhonenumber.rows.length > 0) {
      return res
        .status(400)
        .send("Số điện thoại đã tồn tại, vui lòng chọn số điện thoại khác");
    }

    // Bước 2: Chèn thông tin người dùng vào cơ sở dữ liệu
    const newUser = await pool.query(
      'INSERT INTO "User" (username, password, email, fullname, phonenumber, role, status, shipperstatus, deliveryarea) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        username,
        hashedPassword,
        email,
        fullname,
        phonenumber,
        role,
        status,
        shipperstatus,
        deliveryarea,
      ]
    );

    const userId = newUser.rows[0].userid; // Lấy userId vừa được tạo

    // Tải ảnh đại diện lên Storage
    let avatarUrl = null;
    if (avatar) {
      const avatarBuffer = avatar.buffer;
      const avatarFileName = `avatars/${uuidv4()}`;
      const avatarRef = ref(storage, avatarFileName);

      await uploadBytes(avatarRef, avatarBuffer, {
        contentType: avatar.mimetype,
      });
      avatarUrl = await getDownloadURL(avatarRef);
    }

    // Cập nhật thông tin người dùng trong PostgreSQL
    const updatedUser = await pool.query(
      'UPDATE "User" SET street = $1, commune = $2, district = $3, province = $4, indentitycard = $5, dob = $6, avatar = $7 WHERE userid = $8 RETURNING *',
      [
        street,
        commune,
        district,
        province,
        indentityCard,
        dob,
        avatarUrl,
        userId,
      ]
    );

    //Lấy thông tin nhà phân phối
    const distributor = await pool.query(
      `SELECT distributorid FROM distributor`
    );

    const shipperName = await pool.query(
      `SELECT fullname FROM "User" WHERE userid = $1`,
      [userId]
    );
    const distributorid = distributor.rows[0];
    // Gọi hàm để gửi thông báo cho nhà phân phối
    notificationUtils.createNotification(
      distributorid.distributorid,
      "Distributor",
      "Đăng ký tài khoản người giao hàng mới",
      `Có người giao hàng ${shipperName.rows[0].fullname} mới đăng ký tài khoản, hãy xét duyệt để người giao hàng hoàn tất thủ tục đăng ký`,
      "CreateNewShipper"
    );

    // Trả về kết quả
    res.json({ message: "Đăng ký thành công", user: updatedUser.rows[0] });
  } catch (error) {
    console.error("Error during shipper registration:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  registerStep1,
  registerStep2,
  upload,
  login,
  refreshToken,
  logout,
  registerFarmerStep1,
  registerFarmerStep2,
  registerFarmerStep3,
  loginDistributor,
  shipperRegister,
};
