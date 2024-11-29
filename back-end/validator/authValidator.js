
const validateUsername = (username) => {
  if (!username || username.length < 3 || username.length > 30) {
    return 'Tên đăng nhập phải từ 3 đến 30 ký tự!';
  }
  return null;
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự!';
  }
  return null;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return 'Địa chỉ email không hợp lệ!';
  }
  return null;
};

const validateFullname = (fullname) => {
  if (!fullname || fullname.length < 10 || fullname.length > 50) {
    return 'Họ và tên phải từ 10 đến 50 ký tự!';
  }
  return null;
};

const validatePhonenumber = (phonenumber) => {
  const phoneRegex = /^0[0-9]{9}$/;
  if (!phonenumber || !phoneRegex.test(phonenumber)) {
    return 'Số điện thoại không hợp lệ!';
  }
  return null;
};

module.exports = {
  validateUsername,
  validatePassword,
  validateEmail,
  validateFullname,
  validatePhonenumber
};