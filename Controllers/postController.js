import { sendEmailNotification } from "../Middleware/emailTemplate.js";
import Post from "../Models/postModel.js";
import user from "../Models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "Postedby and text fields are required" });
    }

    const userDetails = await user.findById(postedBy);
    if (!userDetails) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userDetails._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
    }

    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    //console.log(newPost);

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
    //console.log(err);
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "username")
      .populate("likes", "username")
      .populate("replies.userId", "username");

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Failed to retrieve posts" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to delete post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const likePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id; // Assuming you use middleware to set req.user

  try {
    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: "Post already liked." });
    }

    // Add user ID to the likes array
    post.likes.push(userId);
    await post.save();

    return res
      .status(200)
      .json({ message: "Post liked successfully.", userId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error liking the post." });
  }
};

const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    // Find the post and populate the author's email and name
    const post = await Post.findById(postId).populate("postedBy", "email name");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Create the reply object
    const reply = { userId, text, userProfilePic, username };

    // Push the reply to the post's replies array and save the post
    post.replies.push(reply);
    await post.save();

    // Send an email notification to the post's author (postedBy)
    await sendEmailNotification(
      post.postedBy.email,
      "comment",
      username,
      postId,
      text
    );

    // Respond with the reply data
    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const userDetails = await user.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = userDetails.following;

    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });

    res.status(200).json(feedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const userDetails = await user.findOne({ username });
    if (!userDetails) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: userDetails._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createPost,
  getPost,
  getAllPosts,
  deletePost,
  likePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
};
