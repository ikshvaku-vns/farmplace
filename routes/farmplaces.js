const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const farmplaces = require("../controllers/farmplaces.js");

const { isLoggedIn, isAuthor, validateFarmplace } = require("../middleware.js");
const farmplace = require("../models/farmplace.js");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router
  .route("/")
  .get(catchAsync(farmplaces.home))
  .post(isLoggedIn, validateFarmplace, catchAsync(farmplaces.createFarmplace));

router.get("/new", isLoggedIn, farmplaces.renderNewForm);
router.get("/sellers", catchAsync(farmplaces.sellers));
router.get("/prices", catchAsync(farmplaces.prices));
router.post("/create-checkout-session", farmplaces.createCheckoutSession);

router.get("/success", (req, res) => {
  res.render("success", { sessionId: req.query.session_id });
});

router.get("/cancel", (req, res) => {
  res.render("cancel");
});

router
  .route("/:id")
  .get(catchAsync(farmplaces.showFarmplace))
  .put(
    isLoggedIn,
    isAuthor,
    validateFarmplace,
    catchAsync(farmplaces.updateFarmplace)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(farmplaces.deleteFarmplace));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(farmplaces.renderEditForm)
);

module.exports = router;
