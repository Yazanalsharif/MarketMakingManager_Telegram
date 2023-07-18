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
  verifyTime,
  removeItemArray,
} = require("./stageUtils");

//modules
const {
  addActivityReport,
  getReports,
  deleteReportConfig,
  getSpecificReport,
  getEmailsInTheReport,
  updateReport,
} = require("../../models/Report");

// Choose the report that you want to complete the process with
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

// confirm the delete action
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
//email step for let the user enter more than one email
function emailStep() {
  const step = async (ctx) => {
    try {
      console.log("coming to email step");
      let query;
      let shouldEdit = true;
      let title = "";
      let email;

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          ctx.message.text = ctx.message.text.trim().toLowerCase();
          if (ctx.message.text.match(MODELS.activityReport.emails.verify)) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            email = ctx.message.text;

            // if the emails is empty please assign it an array
            if (ctx.wizard.state.data.emails === undefined) {
              ctx.wizard.state.data.emails = [];
              ctx.wizard.state.data.emails.push(email);
            } else {
              console.log(ctx.wizard.state.data.emails.includes(email));
              // if the email exist in the array
              if (!ctx.wizard.state.data.emails.includes(email)) {
                ctx.wizard.state.data.emails.push(email);
              } else {
                ctx.wizard.state.message =
                  "You already entered the same email, Please enter a different email or click Next\n\n";
              }
            }
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            console.log("error message");
            ctx.wizard.state.message =
              MODELS.activityReport.emails.warning + "\n\n";
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
        let emailTitle = `Registered emails: \n`;
        ctx.wizard.state.message === undefined
          ? (ctx.wizard.state.message = emailTitle)
          : (ctx.wizard.state.message = ctx.wizard.state.message + emailTitle);

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

        dataToSave["time"] = ctx.wizard.state.data?.time;
        dataToSave["emails"] = ctx.wizard.state.data?.emails;
        dataToSave["type"] = ctx.wizard.state.data?.type;
        // dataToSave["priceStrategy"] = priceStrategy;
        dataToSave["pair"] =
          ctx.wizard.state.data.base + "-" + ctx.wizard.state.data.quote;

        dataToSave["sandbox"] = true;
        dataToSave["enable"] = ctx.wizard.state.data.enable || true;

        console.log(`data`, dataToSave);
        console.log(`pairId`, ctx.wizard.state.pairId);
        console.log(`adminId`, ctx.wizard.state.adminId);

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

// delete email step
function deleteEmailStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to delete email step");
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

      if (
        !ctx.wizard.state.data.emails ||
        ctx.wizard.state.data.emails?.length === 0
      ) {
        ctx.wizard.state.message = `There are no emails registered\n\n`;
        // // get the list of the emails
        // const emailList = await getEmailsInTheReport(
        //   ctx.wizard.state.adminId,
        //   ctx.wizard.state.pairId,
        //   ctx.wizard.state.reportId
        // );
        // if (emailList.length === 0) {
        //   ctx.wizard.state.message = `There are no Emails registered\n\n`;
        // } else {
        //   ctx.wizard.state.emailList = emailList;
        // }
      }
      // } else {
      // }

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        // OLD
        // const isEmailExist = ctx.wizard.state.emailList?.includes(query);
        // NES
        const isEmailExist = ctx.wizard.state.data.emails?.includes(query);

        // here check the emails that you want to delete
        if (isEmailExist) {
          if (ctx.wizard.state.removedEmails === undefined)
            ctx.wizard.state.removedEmails = [];

          // push the removed email to the removed email array
          ctx.wizard.state.removedEmails.push(query);
          // remove emails from the email list
          removeItemArray(ctx.wizard.state.data.emails, query);
          console.log(
            "emails after delete one item",
            ctx.wizard.state.data.emails
          );
          // // remove email from the emails list
          // removeItemArray(ctx.wizard.state.data.emails, query);
        }

        console.log(query);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_deleteEmail") {
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
        title = MODELS.activityReport.deleteEmails.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }

      // we need this to be executed after the help condition
      if (ctx.wizard.state.removedEmails) {
        ctx.wizard.state.message === undefined
          ? (ctx.wizard.state.message = "The Removed emails:\n")
          : (ctx.wizard.state.message =
              ctx.wizard.state.message + "The Removed emails:\n");

        for (let removed of ctx.wizard.state.removedEmails) {
          console.log(removed);
          ctx.wizard.state.message += removed + "\n";
        }
        ctx.wizard.state.message += "\n";
      }

      if (ctx.wizard.state.helpMode) {
        title = MODELS.activityReport.deleteEmails.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.activityReport.deleteEmails.title
            : ctx.wizard.state.message +
              MODELS.activityReport.deleteEmails.title;
      }

      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }

      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      // if the user click next
      if (query === "next_from_remove_emails") {
        ctx.wizard.next();
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }
      // help mode
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        console.log(`The emails as an options, `, ctx.wizard.state.data.emails);
        // display the list of the existing emails
        for (let option of ctx.wizard.state.data.emails) {
          keyboard_options[0].push({
            text: option,
            callback_data: option,
          });
        }
        // push the options object in the inline keyboard
        keyboard_options.push([
          { text: "Next", callback_data: "next_from_remove_emails" },
        ]);
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_deleteEmail" },
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

// make this function for the report
function updateConfirmationStep() {
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
      if (query === "update") {
        console.log(ctx.wizard.state.data);

        let dataToSave = {};

        dataToSave["time"] = ctx.wizard.state.data?.time;
        dataToSave["emails"] = ctx.wizard.state.data?.emails;
        dataToSave["type"] = ctx.wizard.state.data?.type;
        dataToSave["pair"] =
          ctx.wizard.state.data.base + "-" + ctx.wizard.state.data.quote;
        dataToSave["sandbox"] = true;
        dataToSave["enable"] = ctx.wizard.state.data?.enable || true;

        console.log(`The data to save`, dataToSave);
        console.log(`pairId`, ctx.wizard.state.pairId);
        console.log(`adminId`, ctx.wizard.state.adminId);

        const activityReport = await updateReport(
          dataToSave,
          ctx.wizard.state.adminId,
          ctx.wizard.state.pairId,
          ctx.wizard.state.reportId
        );

        // if the activity report has no been created becuase a duplication error
        if (!activityReport) {
          ctx.wizard.state.message = `The Server couldn't handle the process Please contact to the admin or try again later\n\n`;
        } else {
          await mainMenu(ctx, bot);
          return ctx.scene.leave();
        }
      }

      // if the update didn't comfirmed
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
          ? MODELS.activityReport.updateConfirmation.title + `\n` + dataToPrint
          : ctx.wizard.state.message +
            MODELS.activityReport.updateConfirmation.title +
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
        for (let option of MODELS.activityReport.updateConfirmation.options) {
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

// for enable the report or disable it
function enableStep() {}

// Exports the modules
module.exports = {
  selectReport,
  deleteReportConfirmationStep,
  emailStep,
  typeStep,
  timeStep,
  telegramStep,
  confirmationReportStep,
  deleteEmailStep,
  updateConfirmationStep,
};
