import user from "../Models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmailNotification } from "../Middleware/emailTemplate.js";

dotenv.config();

//Register User
export const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;

  // Validation
  if (
    !name ||
    !username ||
    !email ||
    !password ||
    name === "" ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return res.status(400).json({ message: "Please fill all fields" });
  }
  try {
    // Check for existing username and email
    const userName = await user.findOne({ username: username });
    if (userName) {
      return res.status(400).json({ message: "Username already Taken" });
    }

    const userEmail = await user.findOne({ email: email });
    if (userEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create a new user
    const newUser = new user({
      name,
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password || email.trim() === "" || password.trim() === "") {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    // Check for existing user
    const userDetails = await user.findOne({ email: email });
    if (!userDetails) {
      return res.status(401).json({ message: "Invalid user,Please Register" });
    }

    // Check if password matches
    const isMatch = await bcryptjs.compare(password, userDetails.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create and sign JWT token
    const token = jwt.sign({ id: userDetails.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "12h",
    });

    const { password: passkey } = userDetails._doc;

    res.json({ message: "Logged in successfully", token,userDetails });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get User Details
export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const userDetials = await user.findById(id);

    if (userDetials) {
      const { password, ...otherDetails } = userDetials._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(404).json({ message: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User

export const updateUser = async (req, res) => {
  // Check if user is authorized to update
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: "You are not allowed to update this user" });
  }

  // Password validation
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }

  // Username validation
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return res.status(400).json({ message: "Username must be between 7 and 20 characters" });
    }
    if (req.body.username.includes(" ")) {
      return res.status(400).json({ message: "Username cannot contain spaces" });
    }
  }

  try {
    const updatedFields = {
      name: req.body.name,
      bio: req.body.bio,
      profilePic: req.body.profilePic || undefined, // Ensure it's not defaulting incorrectly
      coverPic: req.body.coverPic || undefined,
    };

    // Update user in the database
    const updatedUser = await user.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true, runValidators: true } // Make sure to run validators
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userDetails } = updatedUser._doc; // Exclude password from response
    res.status(200).json({ message: "Details updated successfully", updatedUser: userDetails });
  } catch (error) {
    console.error("Error updating user:", error); // Log the error for debugging
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res
      .status(403)
      .json({ message: "You are not allowed to delete this user" });
  }
  try {
    await user.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Follow/Unfollow User
export const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params; // The user to follow/unfollow
    const userToModify = await user.findById(id); // User to follow/unfollow
    const currentUser = await user.findById(req.user._id); // Current logged-in user

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" }); // Use 404 for not found
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await user.findByIdAndUpdate(
        id,
        { $pull: { followers: req.user._id } },
        { new: true } // Return the modified document
      );
      await user.findByIdAndUpdate(
        req.user._id,
        { $pull: { following: id } },
        { new: true } // Return the modified document
      );

      // Send email notification for unfollow
      await sendEmailNotification(
        userToModify.email,
        "unfollow",
        currentUser.username
      );

      return res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await user.findByIdAndUpdate(
        id,
        { $push: { followers: req.user._id } },
        { new: true } // Return the modified document
      );
      await user.findByIdAndUpdate(
        req.user._id,
        { $push: { following: id } },
        { new: true } // Return the modified document
      );

      // Send email notification for follow
      await sendEmailNotification(
        userToModify.email,
        "follow",
        currentUser.username
      );

      return res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    console.error("Error in followUnFollowUser: ", err.message); // Log the error for debugging
    return res.status(500).json({ error: "Internal server error" }); // Use a generic error message for security
  }
};