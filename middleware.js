const { farmplaceSchema, commentSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError.js");
const Farmplace = require("./models/farmplace");
const Comment = require("./models/comment.js");

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateFarmplace = (req, res, next) => {
  const { error } = farmplaceSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const farmplace = await Farmplace.findById(id);
  if (!farmplace.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!!");
    return res.redirect(`/farmplace/${id}`);
  }
  next();
};
module.exports.isCommentAuthor = async (req, res, next) => {
  const { id, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!!");
    return res.redirect(`/farmplace/${id}`);
  }
  next();
};
module.exports.validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
