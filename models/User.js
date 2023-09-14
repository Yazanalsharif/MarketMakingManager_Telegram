const mongoose = require("mongoose");
const { db } = require("../config/db");
const ErrorResponse = require("../utils/ErrorResponse");

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

const adminsCollection = db.collection("admins");
// update the admins and add the sign in proberities
const updateAdmin = async (data) => {
  try {
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
      sandbox: true,
    });

    if (!res.writeTime) {
      throw new Error(
        "Error: Server Error, Please contact the admin for more information."
      );
    }
  } catch (err) {
    console.log(err);
  }
};

const getAdmin = async (ctx) => {
  try {
    const chatId =
      ctx.update.message?.chat.id || ctx.update.callback_query?.message.chat.id;

    let adminId;

    const adminsSnapShot = await adminsCollection
      .where("chat_id", "==", chatId)
      .get();

    adminsSnapShot.forEach((doc) => {
      return (adminId = doc.id);
    });

    return adminId;
  } catch (err) {
    console.log(err);
  }
};

const signOut = async (ctx) => {
  try {
    const chatId =
      ctx.update.message?.chat.id || ctx.update.callback_query?.message.chat.id;

    let adminId;

    const adminsSnapShot = await adminsCollection
      .where("chat_id", "==", chatId)
      .get();

    adminsSnapShot.forEach(async (doc) => {
      await adminsCollection.doc(doc.id).update({
        chat_id: 0,
        telegram_user: "",
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const getUserByUserName = async (userName) => {
  try {
    let adminId;

    const adminsSnapshot = await adminsCollection
      .where("telegram_user", "==", userName)
      .where("sandbox", "==", true)
      .get();

    if (adminsSnapshot.empty) {
      return undefined;
    }

    adminsSnapshot.forEach((doc) => {
      adminId = doc.id;
    });

    return adminId;
  } finally {
  }
};

module.exports = { getAdmin, updateAdmin, User, getUserByUserName, signOut };
