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

// update the admins and add the sign in proberities
const updateAdmin = async (data) => {
  const adminsCollection = db.collection("Admins");

  const adminsSnapShot = await adminsCollection
    .where("email", "==", data.email)
    .get();

  if (adminsSnapShot.empty) {
    throw new Error(
      "The data doesn't Exist in the Admin Collection, Please register using the email address"
    );
  }

  // the first doc id in the collection
  let docId;

  adminsSnapShot.forEach((doc) => {
    // store the first doc id in the docId
    docId = doc.id;
  });

  const res = await adminsCollection.doc(docId).update({
    chat_id: data.chat_id,
    telegram_user: data.userName,
    refresh_token: data.refresh_token,
    token: data.token,
  });

  if (!res.writeTime) {
    throw new Error(
      "Error: Server Error, Please contact the admin for more information."
    );
  }
};

module.exports = { updateAdmin, User };
