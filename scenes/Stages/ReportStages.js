const bot = require("../../bot");
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
  verifyTime,
} = require("./stageUtils");

//modules
const {
  addActivityReport,
  getReports,
  deleteReportConfig,
  getSpecificReport,
} = require("../../models/Report");

function selectReport() {
  const stage = async (ctx) => {
    try {
      console.log("Select Report Stage");
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
        ctx.wizard.state.messageToEdit =
          ctx.update.callback_query.message.message_id;

        query = ctx.update.callback_query.data;
        // check if the report doc exist in the database
        // if the report exist then the query is the report doc id
        const report = await getSpecificReport(
          ctx.wizard.state.adminId,
          ctx.wizard.state.pairId,
          query
        );

        // check if the report exist
        if (report) {
          ctx.wizard.next();
          if (ctx.wizard.state.data === undefined) ctx.wizard.state.data = {};
          ctx.wizard.state.reportId = query;
          // ctx.wizard.state.data.pair = report.pair;
          ctx.wizard.state.data.emails = report.emails;
          ctx.wizard.state.data.time = report.time;
          ctx.wizard.state.data.type = report.type;

          ctx.wizard.state.report = report;
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }

        console.log(`The Query: `, query);
      }

      const reports = await getReports(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      if (!reports || reports?.length === 0) {
        ctx.wizard.state.message = `There are no reports belongs to the chosen pair\n\n`;
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "back_from_selectReport") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        // to be refactored
      }

      if (query === "back_from_help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = false;
        ctx.wizard.state.message = undefined;
      }

      if (query === "help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = true;
        title = MODELS.activityReport.reportList.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }

      if (ctx.wizard.state.helpMode) {
        title = MODELS.activityReport.reportList.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.activityReport.reportList.title
            : ctx.wizard.state.message + MODELS.activityReport.reportList.title;
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
        if (reports) {
          for (let option of reports) {
            keyboard_options[0].push({
              text:
                option.data.pair +
                " | " +
                option.data.time +
                " | " +
                option.data.type,
              callback_data: option.id,
            });
          }
        }

        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_selectReport" },
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

      //

      ctx.wizard.state.message = undefined;
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

function deleteReportConfirmationStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to delete confirmation Step");
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
        // Delete the report
        await deleteReportConfig(
          ctx.wizard.state.adminId,
          ctx.wizard.state.pairId,
          ctx.wizard.state.reportId
        );

        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "no") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_deleteReportConfirmation") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }
      let dataToPrint = "";
      const dataKeys = Object.keys(ctx.wizard.state.data);
      console.log(dataKeys);
      for (let key of dataKeys) {
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
            MODELS.activityReport[key].name +
            " : " +
            ctx.wizard.state.data[key] +
            "\n";
        }
      }

      title =
        ctx.wizard.state.message === undefined
          ? MODELS.activityReport.deleteConfirmation.title + `\n` + dataToPrint
          : ctx.wizard.state.message +
            MODELS.activityReport.deleteConfirmation.title +
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
        for (let option of MODELS.activityReport.deleteConfirmation.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([
          {
            text: "Back ",
            callback_data: "back_from_deleteReportConfirmation",
          },
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

function emailStep() {
  const step = async (ctx) => {
    try {
      console.log("coming to email step");
      let query;
      let shouldEdit = true;
      let title = "";
      let emails = [];

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          // if (
          //   isNumeric(ctx.message.text) &&
          //   parseInt(ctx.message.text) <= MODELS.pairs.limit.max &&
          //   parseInt(ctx.message.text) >= MODELS.pairs.limit.min
          // ) {
          //   let id = ctx.update.message.message_id;
          //   await deleteMessage(ctx, bot, id);
          //   limit = ctx.message.text;
          //   ctx.wizard.state.data.limit = parseInt(limit);
          //   ctx.wizard.next();
          //   resetStage(ctx);
          //   console.log(`resetStage works`);
          //   return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          // }

          if (
            ctx.message.text.trim().match(MODELS.activityReport.emails.verify)
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            emails.push(ctx.message.text);

            // insert the multi emails in the same stage,
            if (
              ctx.wizard.state.data.emails &&
              ctx.wizard.state.data.emails.length !== 0
            ) {
              ctx.wizard.state.data.emails.push(emails[0]);
            } else {
              // the emails will be an array
              ctx.wizard.state.data.emails = emails;
            }
            // ctx.wizard.next();

            // resetStage(ctx);
            // return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.activityReport.emails.warning + "\n";
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

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "back_from_email") {
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
        title = MODELS.activityReport.emails.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }

      // display the emails in the message either it was in the help mode or not
      if (ctx.wizard.state.data.emails) {
        ctx.wizard.state.message = `Registered emails: \n`;
        for (email of ctx.wizard.state.data.emails) {
          ctx.wizard.state.message += email + `\n`;
        }

        ctx.wizard.state.message += `\n`;
      }

      if (query === "next") {
        console.log(ctx.wizard.state.data.emails);
        if (
          !ctx.wizard.state.data.emails ||
          ctx.wizard.state.data.emails.length === 0
        ) {
          ctx.wizard.state.message = `Please Enter an email first\n`;
        } else {
          ctx.wizard.next();
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }
      }

      if (ctx.wizard.state.helpMode) {
        title = MODELS.activityReport.emails.description;
      } else {
        console.log("From the next", ctx.wizard.state.message);
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.activityReport.emails.title
            : ctx.wizard.state.message + MODELS.activityReport.emails.title;
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
        keyboard_options.push([{ text: "Next", callback_data: "next" }]);
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_email" },
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

// type step for submit the type of the report
function typeStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to report type step");
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
        if (checkOptions(MODELS.activityReport.type.options, query)) {
          ctx.wizard.next();
          ctx.wizard.state.data.type = query;
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }
        console.log(query);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_reportType") {
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
        title = MODELS.activityReport.type.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.activityReport.type.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.activityReport.type.title
            : ctx.wizard.state.message + MODELS.activityReport.type.title;
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
        for (let option of MODELS.activityReport.type.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_reportType" },
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
      console.log(ctx.wizard.state);
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

// Enter the time of the report
function timeStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to time step");
      let query;
      let shouldEdit = true;
      let title = "";
      let time;

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          time = await verifyTime(ctx.message.text);

          if (time) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.data.time = time;
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.activityReport.time.warning + "\n\n";
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

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_time") {
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
        title = MODELS.activityReport.time.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.activityReport.time.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.activityReport.time.title
            : ctx.wizard.state.message + MODELS.activityReport.time.title;
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
          { text: "Back ", callback_data: "back_from_time" },
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

// Telegram step to let the user receive the report through telegram
function telegramStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to report add telegram step");
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
        // if (checkOptions(MODELS.activityReport.telegram.options, query)) {
        //   ctx.wizard.next();
        //   ctx.wizard.state.data.type = query;
        //   resetStage(ctx);
        //   return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        // }
        console.log(query);
      }
      // check the query value if yes store the telegram user, if not don't

      if (query === "yes") {
        ctx.wizard.state.data.telegram =
          ctx.update.callback_query.from.username;
        console.log(ctx.update.callback_query.from.username);
        ctx.wizard.next();
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      } else if (query === "no") {
        ctx.wizard.state.data.telegram = undefined;
        ctx.wizard.next();
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_reportTelegram") {
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
        title = MODELS.activityReport.telegram.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.activityReport.telegram.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.activityReport.telegram.title
            : ctx.wizard.state.message + MODELS.activityReport.telegram.title;
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
        for (let option of MODELS.activityReport.telegram.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_reportTelegram" },
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

// Confirm the create report process
function confirmationReportStep() {
  let step = async (ctx) => {
    try {
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

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query && !ctx.wizard.state.firstEntry) {
        query = ctx.update.callback_query.data;
      }

      ctx.wizard.state.firstEntry = false;

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "yes") {
        console.log(ctx.wizard.state.data);
        // let priceStrategy = {
        //   type: ctx.wizard.state.data.priceStrategyType,
        //   threshold: ctx.wizard.state.data.priceStrategyThreshold,
        // };
        // to display
        ctx.wizard.state.data.enable = true;
        let dataToSave = {};
        // to display

        // dataToSave["base"] = ctx.wizard.state.data.base;
        // dataToSave["quote"] = ctx.wizard.state.data.quote;
        // dataToSave["limit"] = ctx.wizard.state.data.limit;
        dataToSave["time"] = ctx.wizard.state.data?.time;
        dataToSave["emails"] = ctx.wizard.state.data?.emails;
        dataToSave["type"] = ctx.wizard.state.data?.type;
        // dataToSave["priceStrategy"] = priceStrategy;
        dataToSave["pair"] =
          ctx.wizard.state.data.base + "-" + ctx.wizard.state.data.quote;
        // dataToSave["symbol"] =
        //   ctx.wizard.state.data.base + ctx.wizard.state.data.quote;
        // dataToSave["buySellDiff"] = ctx.wizard.state.data.buySellDiff;
        // dataToSave["engineName"] = ctx.wizard.state.data.engine;
        // dataToSave["engine"] = ctx.wizard.state.data.engine;
        dataToSave["sandbox"] = true;
        dataToSave["enable"] = ctx.wizard.state.data.enable || true;

        console.log(`data`, dataToSave);
        console.log(`pairId`, ctx.wizard.state.pairId);
        console.log(`adminId`, ctx.wizard.state.adminId);
        // await addNewPair(dataToSave, ctx.wizard.state.adminId);
        const activityReport = await addActivityReport(
          dataToSave,
          ctx.wizard.state.adminId,
          ctx.wizard.state.pairId
        );

        // if the activity report has no been created becuase a duplication error
        if (!activityReport) {
          ctx.wizard.state.message = `The report config already exist with the same time and type, Please Enter another time or type\n\n`;
        } else {
          await mainMenu(ctx, bot);
          return ctx.scene.leave();
        }
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
      console.log(dataKeys);
      for (let key of dataKeys) {
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
            MODELS.activityReport[key].name +
            " : " +
            ctx.wizard.state.data[key] +
            "\n";
        }
      }

      title =
        ctx.wizard.state.message === undefined
          ? MODELS.activityReport.confirmation.title + "\n" + dataToPrint
          : ctx.wizard.state.message +
            MODELS.activityReport.confirmation.title +
            "\n" +
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
        for (let option of MODELS.activityReport.confirmation.options) {
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
  selectReport,
  deleteReportConfirmationStep,
  emailStep,
  typeStep,
  timeStep,
  telegramStep,
  confirmationReportStep,
};
