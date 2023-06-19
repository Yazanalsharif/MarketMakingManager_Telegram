const bot = require("../../bot");
const { firebase } = require("../../config/db");

// schemas
const { MODELS } = require("../../models/models");

// views
const { mainMenu, signInView, mainMenuEditable } = require("../../view/main");

//utils
const deleteMessage = require("../../utils/deleteMessage");
const {
  checkOptions,
  contentShouldEdit,
  resetStage,
  isNumeric,
} = require("./stageUtils");

// models
const { updateAdmin } = require("../../models/User");

// controllers
const { signInUser } = require("../../controllers/userController");
const auth = firebase.auth();

function emailStep(back = "back") {
  const step = async (ctx) => {
    try {
      console.log("coming to email step: Sign in");
      let query;
      let shouldEdit = true;
      let title = "";
      let email;

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          const isExist = await isEmailExist(ctx.message?.text);

          if (
            ctx.message.text.trim().match(MODELS.user.email.verify) &&
            isExist
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            email = ctx.message.text;
            // check if the email Exist

            if (ctx.wizard.state.data === undefined) ctx.wizard.state.data = {};
            ctx.wizard.state.data.email = email.trim();
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message = MODELS.user.email.warning + "\n\n";
          }
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }

      ctx.wizard.state.firstEntry = false;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        // the message to be edited
        ctx.wizard.state.messageToEdit =
          ctx.update.callback_query.message.message_id;
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      if (query === "main") {
        await signInView(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "back_from_email") {
        if (back === "back") {
          ctx.wizard.selectStep(ctx.wizard.cursor - 1);
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        } else if (back === "signinList") {
          await signInView(ctx, bot);
          return ctx.scene.leave();
        }
      }

      if (query === "back_from_help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = false;
        ctx.wizard.state.message = undefined;
      }

      if (query === "help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = true;
        title = MODELS.user.email.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }

      if (ctx.wizard.state.helpMode) {
        title = MODELS.user.email.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.user.email.title
            : ctx.wizard.state.message + MODELS.user.email.title;
      }

      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }

      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_email" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
        ]);
      }

      if (shouldEdit) {
        console.log(`edit the message`);
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      ctx.wizard.state.message = undefined;
      return;
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  };
  return step;
}

function passwordStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to password step: Sign in");
      let query;
      let shouldEdit = true;
      let title = "";
      let user;

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
          // we suppose ctx.message.text to be password
          user = await signInUser(
            ctx.wizard.state.data.email,
            ctx.message.text
          );

          if (user) {
            // let id = ctx.update.message.message_id;
            // await deleteMessage(ctx, bot, id);

            // Enter the data to the database
            const data = {
              email: ctx.wizard.state.data.email,
              chat_id: ctx.chat.id,
              userName: ctx.chat.username,
              token: user.idToken,
              refresh_token: user.refreshToken,
            };

            console.log(data);

            // await updateAdmin(data);

            // here is throwing error the message won't be edited
            // mainMenu doesn't edit the message
            await mainMenuEditable(ctx, bot);
            return ctx.scene.leave();
          } else {
            // let id = ctx.update.message.message_id;
            // await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message = MODELS.user.password.warning + "\n\n";
            console.log(ctx.wizard.state.message);
          }
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }

      ctx.wizard.state.firstEntry = false;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      if (query === "signin") {
        await signInView(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_password") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }
      if (query === "back_from_help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = false;
        ctx.wizard.state.message = undefined;
      }
      if (query === "help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = true;
        title = MODELS.user.password.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.user.password.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.user.password.title
            : ctx.wizard.state.message + MODELS.user.password.title;
      }
      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }
      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_password" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "signin" },
        ]);
      }

      if (shouldEdit) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      ctx.wizard.state.message = undefined;
      return;
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  };

  return step;
}

const isEmailExist = async (email) => {
  try {
    const isExist = await auth.getUserByEmail(email);
    console.log(`is exist`, isExist);
    return isEmailExist;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

module.exports = {
  emailStep,
  passwordStep,
};
