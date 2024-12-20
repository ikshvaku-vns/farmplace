const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Comment = require("../models/comment");

const FarmplaceSchema = new Schema({
  name: String,
  price: Number,
  farmproduct: String,
  location: String,
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
