import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    admin: {
      type: Boolean,
      default: false
    },
    comment: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://i.pinimg.com/564x/d0/7b/a6/d07ba6dcf05fa86c0a61855bc722cb7a.jpg",
    },
    rate: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
