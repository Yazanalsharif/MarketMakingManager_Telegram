const User = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");

const isUserExist = async (ctx) => {
  let fromUser;

  // this will be deleted after finishing the bot

  fromUser =
    ctx.update.message?.from.username ||
    ctx.update.callback_query?.from.username;

  const isFromUser = await User.findOne({ userName: fromUser });

  // check if the user has access to do this
  if (!isFromUser || !isFromUser.chat_id) {
    throw new ErrorResponse(
      `Access Denied: Please check if you are registered and you completed the registration`
    );
  }
};

const isAuthorized = async (ctx) => {
  const chatId = ctx.chat.id;

  const snapShot = await db
    .collection("Admins")
    .where("chat_id", "==", chatId)
    .get();

  // check if there are a user has the same chat id
  if (snapShot.docs.length === 0) {
    throw new ErrorResponse(`Access Denied: Please sign in...`);
  }
};

module.exports = { isUserExist, isAuthorized };
