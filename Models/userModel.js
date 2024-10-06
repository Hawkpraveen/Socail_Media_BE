import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 6,
      required: true,
    },
    profilePic: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg",
    },
    coverPic: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg",
    },
    followers: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // reference to User
        username: { type: String, required: true },
      },
    ],
    following: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // reference to User
        username: { type: String, required: true },
      },
    ],
    bio: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("User", userSchema);
export default user;
