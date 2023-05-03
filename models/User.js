const mongoose = require("mongoose");
const { db } = require("../config/db");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, `Please Enter The UserName`],
    unique: [true, `The UserName Already Exist`],
    maxLength: [32, `The Max length must be 32`],
    minLength: [5, `The Min length must be 5 characters`],
  },
  chat_id: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Also the operations for the Admins over firestore will be here

const User = mongoose.model("User", UserSchema);

module.exports = User;
