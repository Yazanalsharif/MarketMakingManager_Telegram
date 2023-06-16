const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");
const { firebase } = require("../config/db");
const { signInUser } = require("../controllers/userController");

const { updateAdmin } = require("../models/User");
const deleteMessage = require("../utils/deleteMessage");
const { signInView, mainMenu } = require("../view/main");
const { emailStep, passwordStep } = require("./Stages/UserStages");
const bot = require("../bot");

const auth = firebase.auth();

const Wizard = Scenes.WizardScene;

// @Description             sign the user to the telegram bot
// access                   Public
const signin = new Scenes.WizardScene(
  "signin",
  emailStep("signinList"),
  passwordStep()
  // async (ctx) => {
  //   try {
  //     // Ask for the email Address
  //     await ctx.reply(`Please Enter your email address to sign in`, {
  //       reply_markup: {
  //         inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
  //       },
  //     });

  //     // to store the data and pass it throgh middle ware
  //     ctx.wizard.state.data = {};
  //     ctx.wizard.state.delete = ctx.update.callback_query.message.message_id;
  //     // next middleware
  //     return ctx.wizard.next();
  //   } catch (err) {
  //     await setTimeout(() => {
  //       let id = ctx.update.callback_query.message.message_id + 1;
  //       deleteMessage(ctx, bot, id);
  //     }, 1000);

  //     await signInView(ctx, bot);
  //     return ctx.scene.leave();
  //   }
  // },
  // async (ctx) => {
  //   try {
  //     let query;

  //     // check if the ctx came from the inline keyboard
  //     query = ctx.update.callback_query?.data;

  //     // if the user didn't confirmed
  //     if (query === `No`) {
  //       await signInView(ctx, bot);
  //       return ctx.scene.leave();
  //     }

  //     // check if the email Exist
  //     const isExist = await auth.getUserByEmail(ctx.update.message?.text);

  //     if (!isExist) {
  //       throw new ErrorResponse(
  //         "The Email doesn't exist Please try with another email"
  //       );
  //     }

  //     ctx.wizard.state.data.email = ctx.update.message?.text;

  //     await deleteMessage(ctx, bot, ctx.wizard.state.delete + 1);

  //     await ctx.reply(`Please Enter your password`, {
  //       reply_markup: {
  //         inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
  //       },
  //     });

  //     ctx.wizard.state.delete = ctx.update.message.message_id;

  //     // pass to the next middle ware
  //     return ctx.wizard.next();
  //   } catch (err) {
  //     console.log(err);

  //     ctx.reply(err.message);
  //     await setTimeout(() => {
  //       let id = ctx.update.message.message_id + 1;
  //       deleteMessage(ctx, bot, id);
  //     }, 1000);
  //   }
  // },
  // async (ctx) => {
  //   try {
  //     const query = ctx.update.callback_query?.data;

  //     // if the user didn't confirmed
  //     if (query === `No`) {
  //       await signInView(ctx, bot);
  //       return ctx.scene.leave();
  //     }
  //     ctx.wizard.state.data.password = ctx.update.message?.text;

  //     const res = await signInUser(
  //       ctx.wizard.state.data.email,
  //       ctx.wizard.state.data.password
  //     );

  //     // Enter the data to the database
  //     const data = {
  //       email: ctx.wizard.state.data.email,
  //       chat_id: ctx.chat.id,
  //       userName: ctx.chat.username,
  //       token: res.idToken,
  //       refresh_token: res.refreshToken,
  //     };

  //     await updateAdmin(data);

  //     deleteMessage(ctx, bot, ctx.wizard.state.delete + 1);

  //     await mainMenu(ctx, bot);

  //     return ctx.scene.leave();
  //     // console.log(ctx.update.callback_query.id);
  //   } catch (err) {
  //     // ************************* Attention Herer
  //     // we will handle the error that coming from the sign in and the update User
  //     console.log(err);

  //     await ctx.reply(err.message);
  //     await setTimeout(() => {
  //       let id = ctx.update.message.message_id + 1;
  //       deleteMessage(ctx, bot, id);
  //     }, 1000);
  //   }
  // }
);

module.exports = { signin };
