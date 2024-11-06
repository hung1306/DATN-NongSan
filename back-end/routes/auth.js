const router = require("express").Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddlewares");
const authMiddlewares = require("../middlewares/authMiddlewares");

router.post("/register/step1", authController.registerStep1);
router.post(
  "/register/step2/:userId",
  authController.upload.single("avatar"),
  authController.registerStep2
);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);

router.get("/logout", authController.logout);
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});
//farmer
router.post(
  "/farmer/register/step1",
  authController.upload.single("avatar"),
  authController.registerFarmerStep1
);
router.post(
  "/farmer/register/step2/:userId",
  authController.upload.fields([
    { name: "farmlogo", maxCount: 1 },
    { name: "farmimage", maxCount: 1 },
    { name: "farmimage1", maxCount: 1 },
    { name: "farmimage2", maxCount: 1 },
    { name: "farmimage3", maxCount: 1 },
  ]),
  authController.registerFarmerStep2
);
router.post(
  "/farmer/register/step3/:userId",
  authController.registerFarmerStep3
);

router.post("/distributor/login", authController.loginDistributor);

router.post(
  "/shipper/register",
  authController.upload.single("avatar"),
  authController.shipperRegister
);

module.exports = router;
