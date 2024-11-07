import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

function FarmerPrivateRoute({ element: Component }) {
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));

  return isAuthenticated ? Component : <Navigate to="/farmer/login" />;
}

FarmerPrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default FarmerPrivateRoute;