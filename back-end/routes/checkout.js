const router = require("express").Router();
const checkoutController = require("../controllers/checkoutController");

router.post("/checkout", checkoutController.addCheckOut);
router.get("/shipping-info/:id", checkoutController.getShippingInfo);
router.get("/purchase-history/:userId", checkoutController.getPurchaseHistory);
router.get("/order/:orderId", checkoutController.getOrderItemById);
router.get("/farmer/orders/:farmerId", checkoutController.getAllOrdersByFarmer);
router.get("/farmer/order/:orderId", checkoutController.getOrderDetailFarmer);
router.put("/farmer/order-update", checkoutController.updateStatusOrder);

router.post(
  "/checkout/create-payment-session",
  checkoutController.createPaymentSession
);
router.get(
  "/checkout/confirm-payment/:sessionId",
  checkoutController.confirmPaymentSession
);
router.post("/checkout/save-payment", checkoutController.savePaymentToDB);

router.get("/distributor/orders", checkoutController.getAllOrderToDistributor);
router.put(
  "/distributor/order-update",
  checkoutController.updateStatusByDistributor
);
router.put("/cancel-order", checkoutController.cancelOrderByCustomer);

router.get(
  "/shipper/deliveryArea/:orderId",
  checkoutController.getAllShipperOfDeliveryarea
);

router.put("/order/shipper-update", checkoutController.updateShipperForOrder);

router.get(
  "/shipper/orders/:shipperid",
  checkoutController.getAllOrderToShipper
);

router.get(
  "/shipper/orderdetail/:orderIdDetail",
  checkoutController.getOrderDetailShipper
);
module.exports = router;
