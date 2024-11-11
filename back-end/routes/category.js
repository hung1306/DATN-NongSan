const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router.get("/category", categoryController.getCategories);
router.get("/category/:id", categoryController.getCategoryById);
router.delete("/category/:id", categoryController.deleteCategory);

router.get("/distributor/categories", categoryController.getAllCategory);
router.get("/distributor/categories/:id", categoryController.getCategoryById);

router.post(
  "/distributor/create/category",
  categoryController.upload.single("categoryimage"),
  categoryController.createCategoryforDistributor
);
router.delete(
  "/distributor/delete/category/:id",
  categoryController.deleteCategory
);
router.put(
  "/distributor/update/category/:id",
  categoryController.upload.single("categoryimage"),
  categoryController.updateCategoryforDistributor
);
router.get(
  "/farmer/categories/count/:userid",
  categoryController.getCategoryCountByFarmerId
);
router.get("/count-categories", categoryController.getCategoryCount);

module.exports = router;
