const chalk = require("chalk");
const User = require("../models/User");
const { errorHandlerBot } = require("../utils/errorHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// @Description             insert new user to the data base throwgh The Telegram Bot
// access                   Admin
const addUser = async (ctx, bot) => {
  //add the user properties: userName
  try {
    const text = ctx.update.message.text;
    const data = text.split(" ");
    const userName = data[1];

    if (!isNaN(userName)) {
      console.log("Please write a correct userName");
      throw new ErrorResponse("Please write a correct UserName");
    }

    // check The username in the database if he is already exist. ======
    const user = await User.findOne({ userName });

    if (user) {
      ctx.reply(`The user ${userName} is already Exist`);
      return console.log("The user is already Exist");
    }

    const newUser = await User.create({ userName });

    console.log(newUser);
    // send the message to the user which the userName has been added to the database
    ctx.reply(
      `The username has been added: ${userName}\nPlease let the user run start command to https://t.me/${ctx.botInfo.username}`
    );
  } catch (err) {
    // send logs with the error message
    errorHandlerBot(ctx, err);
    console.log(err.message);
  }
};

// @Description             delete the user from the database throwgh Telegram Bot
// access                   Admin
const deleteUser = async (ctx) => {
  try {
    const text = ctx.update.message.text;
    const data = text.split(" ");

    const userName = data[1];

    // find if the user exist remove it
    const user = await User.findOneAndDelete({ userName });

    console.log(user);

    if (!user) {
      console.log(`The user: ${userName} doesn't exist in the database`);
      return ctx.reply(`The user: ${userName} doesn't exist in the database`);
    }

    ctx.reply(`The User has been Deleted...`);
  } catch (err) {
    // send logs with the error message
    console.log(err.message);
    // send to the admin through the telegram chat
    errorHandlerBot(err);
  }
};

// @Description             Add the ChatId of the user
// access                   Admin
const addChatId = async (ctx) => {
  try {
    const userName = ctx.chat.username;
    // bring the user from database
    const user = await User.findOne({ userName });

    // check if the user exist in the database
    if (!user) {
      console.log(
        "The user doesn't registered in the database Please contact with the admins"
      );
      throw new ErrorResponse(
        `You are not registered in the database, You can't complete your registerition`
      );
    }

    user.chat_id = ctx.chat.id;
    await user.save();
    //
    console.log(`The User ${user.userName} is Finished the Registerition`);
    ctx.reply(`Congratulations, You completed the registration`);
  } catch (err) {
    console.log(err);
    errorHandlerBot(ctx, err);
  }
};

// @Description             Get the users from the database
// access                   Admin
const getUsers = async (ctx) => {
  try {
    const users = await User.find({});
    // create message
    let message = "";
    for (let i = 0; i < users.length; i++) {
      message += `The User ${i + 1}:\n${users[i].userName}`;

      if (users[i].chat_id) {
        message += ` Active: ${users[i].chat_id}`;
      }
      message += `\n++++++++++++++++++++++++++++++++++++++\n`;
    }

    console.log(users);
    ctx.reply(message);
  } catch (err) {
    errorHandlerBot(ctx, err);
    console.log(err);
  }
};

module.exports = { addUser, deleteUser, getUsers, addChatId };
