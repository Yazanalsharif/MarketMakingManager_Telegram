const User = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");

const isUserExist = async (ctx) => {
  const fromUser = ctx.update.message.from.username;

  const isFromUser = await User.findOne({ userName: fromUser });

  // check if the user has access to do this
  if (!isFromUser || !isFromUser.chat_id) {
    throw new ErrorResponse(
      `Access Denied: Please check if you are registered and you completed the registration`
    );
  }
};

module.exports = isUserExist;
