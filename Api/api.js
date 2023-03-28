const User = require("../models/User");
const express = require("express");
const ErrorResponse = require("../utils/ErrorResponse");
const { Telegraf } = require("telegraf");
const asyncHandler = require("../middlewares/asyncHandler");

const router = express.Router();

const bot = new Telegraf(process.env.BOT_KEY);

// @Description              End Point for letting the bot send Message for a specific user
// @Method                   Post /v1/sendMessage/:userName
// @access                   Public
router.post(
  "/sendMessage/:userName",
  asyncHandler(async (req, res, next) => {
    const message = req.body.message;

    const user = await User.findOne({ userName: req.params.userName });

    if (!user || !user.chat_id) {
      return next(
        new ErrorResponse(
          `The User Doesn't completed his registering, Please make sure The userName and the chatId is exist`,
          400
        )
      );
    }

    bot.telegram.sendMessage(user.chat_id, message);

    res.status(200).json({
      success: true,
      users: user,
      message,
    });
  })
);

// @Description              End Point for letting the bot sending to the users
// @Method                   Post /v1/sendMessage
// @access                   Public
router.post(
  "/sendMessage",
  asyncHandler(async (req, res, next) => {
    const message = req.body.message;

    let sentUsers = [];
    // Get the users
    const users = await User.find({});
    // send a messages for the users
    users.forEach((user) => {
      if (user.chat_id) {
        bot.telegram.sendMessage(user.chat_id, message);
        sentUsers.push(user.userName);
      }
    });

    res.json({
      success: true,
      users: sentUsers,
      message,
    });
  })
);

// @Description              Get the active users from the telegram.
// @Method                   Post /v1/users
// @access                   Public
router.get(
  "/users",
  asyncHandler(async (req, res, next) => {
    const users = await User.find({});
    const actives = [];
    users.forEach((user) => {
      if (user.chat_id) {
        actives.push(user.userName);
      }
    });
    res.status(200).json({
      success: true,
      users: actives,
    });
  })
);

module.exports = router;
