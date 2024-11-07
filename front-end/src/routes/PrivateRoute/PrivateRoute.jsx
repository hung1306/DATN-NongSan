// PrivateRoute.js
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

function PrivateRoute({ element: Component }) {
  // Giả định là bạn lưu token xác thực trong localStorage dưới dạng "accessToken"
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));

  return isAuthenticated ? Component : <Navigate to="/login" />;
}

PrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default PrivateRoute;