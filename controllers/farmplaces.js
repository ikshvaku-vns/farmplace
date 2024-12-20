const Farmplace = require("../models/farmplace");

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
