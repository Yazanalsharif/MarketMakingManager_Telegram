const { bot, notificationBot } = require("../../bot");
// schemas
const { MODELS } = require("../../models/models");

// views
const { mainMenu } = require("../../view/main");

//utils
const deleteMessage = require("../../utils/deleteMessage");
const {
  checkOptions,
  contentShouldEdit,
  resetStage,
  isNumeric,
} = require("./stageUtils");

// models
const { updateStatus } = require("../../models/Status");

function changeStatus() {
  const stage = async (ctx) => {
    try {
      console.log("coming to status change stage");
      let query;
      let shouldEdit = true;
      let title = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let id = ctx.update.message.message_id;
          console.log("id", id);
          await deleteMessage(ctx, bot, id);
          ctx.wizard.state.message = MODELS.errors.textInsteadOfInline.text;
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }
      ctx.wizard.state.firstEntry = false;

      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        if (checkOptions(MODELS.status.status.options, query)) {
          ctx.wizard.next();
          ctx.wizard.state.data.status = query;
          ctx.wizard.state.data.reason = "Manually";
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }
        console.log(query);
      }
      // check the query value if yes store the telegram user, if not don't

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_changeStatus") {
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
        title = MODELS.status.status.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.status.status.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.status.status.title
            : ctx.wizard.state.message + MODELS.status.status.title;
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
        for (let option of MODELS.status.status.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_changeStatus" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
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

  return stage;
}

function updateStatusConfirmationStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to confirmation Type");
      let query;
      let shouldEdit = true;
      let title = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let id = ctx.update.message.message_id;
          console.log("id", id);
          await deleteMessage(ctx, bot, id);
          ctx.wizard.state.message = MODELS.errors.textInsteadOfInline.text;
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

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "yes") {
        let dataToSave = {};
        dataToSave["status"] = ctx.wizard.state.data.status;
        dataToSave["reason"] = ctx.wizard.state.data.reason;
        dataToSave["sandbox"] = true;

        console.log(dataToSave);
        await updateStatus(
          dataToSave,
          ctx.wizard.state.adminId,
          ctx.wizard.state.pairId
        );

        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "no") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_confirmation") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }
      let dataToPrint = "";
      const dataKeys = Object.keys(ctx.wizard.state.data);

      for (let key of dataKeys) {
        console.log(key);
        if (key === "quote" || key === "base") {
          dataToPrint =
            dataToPrint +
            MODELS.pairs[key].name +
            " : " +
            ctx.wizard.state.data[key] +
            "\n";
        } else {
          dataToPrint =
            dataToPrint +
            MODELS.status[key].name +
            " : " +
            ctx.wizard.state.data[key] +
            "\n";
        }
      }

      title =
        ctx.wizard.state.message === undefined
          ? MODELS.pairs.editConfirmation.title + `\n` + dataToPrint
          : ctx.wizard.state.message +
            MODELS.pairs.editConfirmation.title +
            dataToPrint;
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
        for (let option of MODELS.pairs.editConfirmation.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_confirmation" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
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

module.exports = {
  changeStatus,
  updateStatusConfirmationStep,
};
