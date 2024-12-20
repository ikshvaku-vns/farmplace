const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const comments = require("../controllers/comments.js");

const {
  validateComment,
  isLoggedIn,
  isCommentAuthor,
} = require("../middleware.js");

const Farmplace = require("../models/farmplace");
const Comment = require("../models/comment");

router.post(
  "/",
  isLoggedIn,
  validateComment,
  catchAsync(comments.createComment)
);

router.delete(
  "/:commentId",
  isLoggedIn,
  isCommentAuthor,
  catchAsync(comments.deleteComment)
);

module.exports = router;
