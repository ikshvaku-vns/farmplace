const Farmplace = require("../models/farmplace");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require("dotenv").config();
module.exports.home = async (req, res) => {
  res.render("farmplace/home");
};

module.exports.renderNewForm = (req, res) => {
  res.render("farmplace/new");
};

module.exports.sellers = async (req, res) => {
  const farmplace = await Farmplace.find({});
  res.render("farmplace/sellers", { farmplace });
};
module.exports.prices = async (req, res) => {
  const { farmproduct } = req.query; // Get the selected product from query params

  let farmplace;

  if (farmproduct) {
    // Filter farms by the selected product
    farmplace = await Farmplace.find({ farmproduct: farmproduct });
  } else {
    // Show all farms if no product is selected
    farmplace = await Farmplace.find({});
  }

  // Merge farmplace, farmproduct, and stripePublishableKey into one object
  res.render("farmplace/prices", {
    farmplace,
    farmproduct,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};

module.exports.createCheckoutSession = async (req, res) => {
  try {
    const { productId, productPrice } = req.body;

    // Fetch the product from the database
    const farmplace = await Farmplace.findById(productId);

    if (!farmplace) {
      return res.status(404).send("Product not found");
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: farmplace.name, // Use the product name from the database
            },
            unit_amount: productPrice * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).send("Internal server error");
  }
};

module.exports.createFarmplace = async (req, res) => {
  const farmplace = new Farmplace(req.body.farmplace);
  farmplace.author = req.user._id;
  await farmplace.save();
  req.flash("success", "Successfully made a new farmproduct!!");
  res.redirect(`/farmplace`);
};

module.exports.showFarmplace = async (req, res) => {
  const farmplace = await Farmplace.findById(req.params.id)
    .populate({ path: "comments", populate: { path: "author" } })
    .populate("author");
  if (!farmplace) {
    req.flash("error", "Cannot find that farmproduct");
    return res.redirect("/farmplace");
  }
  res.render("farmplace/show", { farmplace });
};

module.exports.renderEditForm = async (req, res) => {
  const farmplace = await Farmplace.findById(req.params.id);
  if (!farmplace) {
    req.flash("error", "Cannot find that farmproduct");
    return res.redirect("/farmplace");
  }
  res.render("farmplace/edit", { farmplace });
};

module.exports.updateFarmplace = async (req, res) => {
  const { id } = req.params;
  const farmplace = await Farmplace.findByIdAndUpdate(id, {
    ...req.body.farmplace,
  });
  req.flash("success", "Successfully updated farmplace");
  res.redirect(`/farmplace/${farmplace._id}`);
};

module.exports.deleteFarmplace = async (req, res) => {
  const { id } = req.params;
  await Farmplace.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted farmplace");
  res.redirect("/farmplace/sellers");
};
