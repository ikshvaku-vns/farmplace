const Comment = require("../models/comment");
const Farmplace = require("../models/farmplace");

module.exports.createComment = async (req, res) => {
  const farmplace = await Farmplace.findById(req.params.id);
  const comment = new Comment(req.body.comment);
  comment.author = req.user._id;
  farmplace.comments.push(comment);
  await comment.save();
  await farmplace.save();
  req.flash("success", "Created new comment");
  res.redirect(`/farmplace/${farmplace._id}`);
};

module.exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  await Farmplace.findByIdAndUpdate(id, { $pull: { comments: commentId } });
  await Comment.findByIdAndDelete(commentId);
  req.flash("success", "Deleted a comment");
  res.redirect(`/farmplace/${id}`);
};
