// ShipperPrivateRoute.js
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

function ShipperPrivateRoute({ element: Component }) {
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));
  return isAuthenticated ? Component : <Navigate to="/shipper/login" />;
}

ShipperPrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default ShipperPrivateRoute;