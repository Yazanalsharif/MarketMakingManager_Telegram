const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    trim: true,
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

const User = mongoose.model("User", UserSchema);

module.exports = User;
