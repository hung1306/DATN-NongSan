const router = require("express").Router();
const auth = require("./auth");
const category = require("./category");
const product = require("./product");

const authFarmer = require("./authFarmer");

router.use("/auth", auth);
router.use("", category);
router.use("", product);

router.use("/authFarmer", authFarmer);


module.exports = router;
