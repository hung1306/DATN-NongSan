import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { truncateText } from "../../../utils/truncaseText";
import { Link } from "react-router-dom";

const OrderDetailsDialog = ({ order, onClose }) => {
  // Ensure order is an array
  const orderArray = Array.isArray(order) ? order : [order];

  if (orderArray.length === 0) return null;

  return (
    <div className="z-50 fixed top-0 left-0 inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center m-auto">
      <div
        className={`bg-white p-6 rounded-lg w-1/2 m-auto text-primary overflow-auto shadow-xl border border-primary ${
          orderArray.length > 1 ? "h-2/5" : ""
        }`}
      >
        <div className="flex justify-end">
          <button
            className={`text-primary px-2 hover:bg-primary hover:text-secondary hover:px-2 text-3xl font-bold fixed`}
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <h2 className="text-2xl text-center font-bold mb-4">
          Chi tiết đơn hàng
        </h2>
        <ul className={`mb-4`}>
          {orderArray.map((product, index) => (
            <li
              key={index}
              className="mb-2 p-2 flex items-center rounded-md cursor-pointer w-full hover:bg-fourth"
            >
              <Link
                to={`/product/${product.productid}`}
                className="flex items-center w-full"
              >
                <img
                  src={product.productimage1}
                  alt={product.productname}
                  className="w-1/6 h-28 object-cover rounded-lg"
                />
                <p className="w-1/4 text-center text-xl font-bold">
                  {product.productname}
                </p>
                <p className="w-1/2 text-left">
                  {truncateText(product.overview, 200)}
                </p>
                <p className="w-1/12 text-center font-semibold text-2xl">
                  {product.quantity}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

OrderDetailsDialog.propTypes = {
  order: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        productimage1: PropTypes.string.isRequired,
        productname: PropTypes.string.isRequired,
        overview: PropTypes.string.isRequired,
        quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
      })
    ),
    PropTypes.shape({
      productimage1: PropTypes.string.isRequired,
      productname: PropTypes.string.isRequired,
      overview: PropTypes.string.isRequired,
      quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }),
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OrderDetailsDialog;
