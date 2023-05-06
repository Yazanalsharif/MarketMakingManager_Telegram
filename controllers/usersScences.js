const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");
const { firebase } = require("../config/db");
const { signInUser } = require("./users");
const { updateAdmin } = require("../models/User");
const { isAuthorized } = require("../middlewares/authorized");

const auth = firebase.auth();

const Wizard = Scenes.WizardScene;

// @Description             sign the user to the telegram bot
// access                   Public
const signin = new Scenes.WizardScene(
  "signin",
  async (ctx) => {
    try {
      // Ask for the email Address
      ctx.reply(`Please Enter your email address to sign in`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });
      // to store the data and pass it throgh middle ware
      ctx.wizard.state.data = {};

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      let query;

      // check if the ctx came from the inline keyboard
      query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      // check if the email Exist
      const isExist = await auth.getUserByEmail(ctx.update.message?.text);

      if (!isExist) {
        throw new ErrorResponse(
          "The Email doesn't exist Please try with another email"
        );
      }

      ctx.wizard.state.data.email = ctx.update.message?.text;

      ctx.reply(`Please Enter your password`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });

      // pass to the next middle ware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(`${err.message}, Please use another Email`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      const query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }
      ctx.wizard.state.data.password = ctx.update.message?.text;

      console.log(ctx.wizard.state.data);

      const res = await signInUser(
        ctx.wizard.state.data.email,
        ctx.wizard.state.data.password
      );

      // Enter the data to the database
      const data = {
        email: ctx.wizard.state.data.email,
        chat_id: ctx.chat.id,
        userName: ctx.chat.username,
        token: res.idToken,
        refresh_token: res.refreshToken,
      };

      await updateAdmin(data);

      ctx.reply(`You are sucessfuly signed in`);

      ctx.scene.leave();
      // console.log(ctx.update.callback_query.id);
    } catch (err) {
      // ************************* Attention Herer
      // we will handle the error that coming from the sign in and the update User
      ctx.reply(`${err.message}`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });
      ctx.scene.leave();
    }
  }
);

module.exports = { signin };
