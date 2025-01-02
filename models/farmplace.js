const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Comment = require("../models/comment");
const { required } = require("joi");

const FarmplaceSchema = new Schema({
  name: String,
  price: Number,
  farmproduct: String,
  location: String,
  dateAdded: {
    type: Date,
    default: Date.now, // Automatically sets the current date and time when a new document is created.
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

FarmplaceSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Comment.deleteMany({
      _id: {
        $in: doc.comments,
      },
    });
  }
});

module.exports = mongoose.model("Farmplace", FarmplaceSchema);
