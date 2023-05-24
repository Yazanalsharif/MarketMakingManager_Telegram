const chalk = require("chalk");
const { User } = require("../models/User");
const { errorHandlerBot } = require("../utils/errorHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const isAuthorized = require("../middlewares/authorized");
const { firebase } = require("../config/db");
const axios = require("axios");

const auth = firebase.auth();

// @Description             insert new user to the data base throwgh The Telegram Bot
// access                   Admin
const addUser = async (ctx, bot) => {
  //add the user properties: userName
  try {
    const text = ctx.update.message.text;
    const data = text.split(" ");
    const userName = data[1];

    await isAuthorized(ctx);

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

    // check if the user exist in the database and He is authorized to do this operation
    await isAuthorized(ctx);

    if (!userName) {
      throw new ErrorResponse(`Please Enter a valid user name`);
    }

    // find if the user exist remove it
    const user = await User.findOneAndDelete({ userName });

    if (!user) {
      throw new ErrorResponse(
        `The user: ${userName} doesn't exist in the database`
      );
    }

    ctx.reply(`The User has been Deleted...`);
  } catch (err) {
    // send logs with the error message
    console.log(err.message);
    // send to the admin through the telegram chat
    errorHandlerBot(ctx, err);
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
    // check if the user exist in the database and He is authorized to do this operation
    await isAuthorized(ctx);

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

// @Description             Update the UserName of the existing user
// access                   Admin
const updateUserName = async (ctx) => {
  try {
    // check if the user exist in the database and He is authorized to do this operation
    await isAuthorized(ctx);

    // find the userName and update it
    const text = ctx.update.message.text;
    const data = text.split(" ");

    const oldUserName = data[1];

    let user = await User.findOne({ userName: oldUserName });

    if (!user) {
      console.log(`The user: ${oldUserName} doesn't exist`);
      throw new ErrorResponse(`The user: ${oldUserName} doesn't exist`);
    }

    user.userName = data[2];

    await user.save();

    ctx.reply(
      `The userName has been update from ${oldUserName} to ${user.userName}`
    );
  } catch (err) {
    errorHandlerBot(ctx, err);
    console.log(err);
  }
};

// @Description             sign the user in to the telegram configuration
// access                   Public
const signInUser = async (email, password) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.API_KEY_FIREBASE}`;
  console.log("the user", email);
  console.log("the password", password);
  const res = await axios.post(url, {
    email: email,
    password: password,
    returnSecureToken: true,
  });
  console.log("Here");

  return res.data;
};

module.exports = {
  addUser,
  deleteUser,
  getUsers,
  addChatId,
  updateUserName,
  signInUser,
};
