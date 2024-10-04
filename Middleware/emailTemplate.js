import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const generateEmailTemplate = (
  actionType,
  senderName,
  postId = null,
  comment = null
) => {
  switch (actionType) {
    case "like":
      return {
        subject: "Someone liked your post!",
        body: `Hey! ${senderName} has liked your post.`,
      };

    case "dislike":
      return {
        subject: "Someone disliked your post!",
        body: `Hey! ${senderName} has disliked your post.`,
      };

    case "follow":
      return {
        subject: "New Follower!",
        body: `Good news! ${senderName} is now following you.`,
      };

    case "unfollow":
      return {
        subject: "Someone unfollowed you!",
        body: `Unfortunately, ${senderName} has unfollowed you.`,
      };

    case "comment":
      return {
        subject: "New Comment on your post!",
        body: `Hey! ${senderName} commented on your post. Comment: "${comment}"`,
      };

    default:
      return {
        subject: "Notification",
        body: "You have a new notification.",
      };
  }
};

// Middleware function to send emails
const sendEmailNotification = async (
  recipientEmail,
  actionType,
  senderName,
  postId = null,
  comment = null
) => {
  try {
    // Create a transporter object using your email service credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_APP_EMAIL,
        pass: process.env.MY_EMAIL_APP_PASSWORD, 
      },
    });

    // Generate email content based on the action
    const emailContent = generateEmailTemplate(
      actionType,
      senderName,
      postId,
      comment
    );

    // Set up email data
    const mailOptions = {
      from: "Socail Media", // Sender address
      to: recipientEmail, // Recipient's email address
      subject: emailContent.subject, // Subject of the email
      text: emailContent.body, // Email body content
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

export { sendEmailNotification };
