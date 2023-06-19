const bot = require("../../bot");
// schemas
const { MODELS } = require("../../models/models");
const { ENGINES } = require("../../models/engines");

// views
const { mainMenu } = require("../../view/main");
const {
  pairsList,
  tradingAccountList,
  activityReportList,
  statusReportList,
  priceStrategyList,
  limitOrderList,
} = require("../../view/marketMaker");

//utils
const deleteMessage = require("../../utils/deleteMessage");
const {
  checkOptions,
  contentShouldEdit,
  resetStage,
  isNumeric,
} = require("./stageUtils");

//modules
const { getAdmin } = require("../../models/User");
const {
  addNewPair,
  getPair,
  getPairs,
  updatePair,
} = require("../../models/Pairs");
const { getReports } = require("../../models/Report");
const { getStatusesData } = require("../../models/Status");

function selectPairStep(back = "back") {
  const stage = async (ctx) => {
    try {
      console.log("SelectPair stage");
      let query;
      let shouldEdit = true;
      let title = "";
      let adminId;

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
      adminId = await getAdmin(ctx);
      //   store the adminId to the session and pass it to the next middleware
      ctx.wizard.state.adminId = adminId;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        ctx.wizard.state.messageToEdit =
          ctx.update.callback_query.message.message_id;
        query = ctx.update.callback_query.data;
        // check if the pair exist in the database
        const pair = await getPair(query, adminId);

        // check if the pair exist
        if (pair) {
          ctx.wizard.next();
          if (ctx.wizard.state.data === undefined) ctx.wizard.state.data = {};
          ctx.wizard.state.pairName = pair.base + `-` + pair.quote;
          ctx.wizard.state.data.base = pair.base;
          ctx.wizard.state.data.quote = pair.quote;
          ctx.wizard.state.pairId = query;
          ctx.wizard.state.pair = pair;
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }
        // if (checkOptions(MODELS.pairs.engine.options, query)) {
        //   ctx.wizard.next();
        //   if (ctx.wizard.state.data === undefined) ctx.wizard.state.data = {};
        //   ctx.wizard.state.data.engine = query;
        //   resetStage(ctx);
        //   return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        // }

        console.log(query);
      }

      const pairs = await getPairs(ctx.wizard.state.adminId);
      ctx.wizard.state.pairs = pairs;

      if (!pairs || pairs?.length === 0) {
        ctx.wizard.state.message = `There are no pairs belongs to the Admin, Please Add new pair\n\n`;
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "back_from_selectPair") {
        console.log(back);
        if (back === "back") {
          ctx.wizard.selectStep(ctx.wizard.cursor - 1);
          resetStage(ctx);
          // return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          // to be refactored
        } else if (back === "pairsList") {
          console.log("going pairsList");
          await mainMenu(ctx, bot);
          return ctx.scene.leave();
          // if the back is in the price strategy scenes scene
        } else if (back === "priceStrategyList") {
          console.log("going to price strategy");
          await priceStrategyList(ctx, bot);
          return ctx.scene.leave();
          // if the back is in the price strategy change scenes scene
        } else if (back === "priceStrategyChangeList") {
          console.log("going to back strategy change");
          await changeStrategyList(ctx, bot);
          return ctx.scene.leave();
          // if the back is in the status scene
        } else if (back === "statusList") {
          console.log("going to status list");
          await statusReportList(ctx, bot);
          return ctx.scene.leave();
        } else if (back === "limitList") {
          console.log("Going to the limit list");
          await limitOrderList(ctx, bot);
          return ctx.scene.leave();
        } else if (back === "reportList") {
          await activityReportList(ctx, bot);
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
        title = MODELS.pairs.pairList.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }

      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.pairList.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.pairList.title
            : ctx.wizard.state.message + MODELS.pairs.pairList.title;
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
        if (pairs) {
          for (let option of pairs) {
            keyboard_options[0].push({
              text: option.data.pair,
              callback_data: option.id,
            });
          }
        }

        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_selectPair" },
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

      console.log(`from the pairslist`, ctx.wizard.state.firstEntry);
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

function engineStep(back = "back") {
  let step = async (ctx) => {
    try {
      console.log("coming to engine");
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
        if (checkOptions(MODELS.pairs.engine.options, query)) {
          ctx.wizard.next();
          if (ctx.wizard.state.data === undefined) ctx.wizard.state.data = {};
          ctx.wizard.state.data.engine = query;
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }
        console.log(query);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_engine") {
        console.log(back);
        if (back === "back") {
          ctx.wizard.selectStep(ctx.wizard.cursor - 1);
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        } else if (back === "pairsList") {
          console.log("going pairsList");
          await pairsList(ctx, bot);
          return ctx.scene.leave();
        } else if (back === "tradingAccountList") {
          console.log("going ot trading account list");
          await tradingAccountList(ctx, bot);
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
        title = MODELS.pairs.engine.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.engine.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.engine.title
            : ctx.wizard.state.message + MODELS.pairs.engine.title;
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
        for (let option of MODELS.pairs.engine.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_engine" },
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
      const adminId = await getAdmin(ctx);
      //
      //  //   store the adminId to the session and pass it to the next middleware
      ctx.wizard.state.adminId = adminId;

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

function baseStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to base");
      let query;
      let shouldEdit = true;
      let title = "";
      let base = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
          base = ctx.message.text;
          ctx.wizard.state.data.base = base.toUpperCase();
          ctx.wizard.next();
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
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
      if (query === "back_from_base") {
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
        title = MODELS.pairs.base.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.base.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.base.title
            : ctx.wizard.state.message + MODELS.pairs.base.title;
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
          { text: "Back ", callback_data: "back_from_base" },
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

function quoteStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to quote");
      let query;
      let shouldEdit = true;
      let title = "";
      let quote = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
          quote = ctx.message.text;
          ctx.wizard.state.data.quote = quote.toUpperCase();
          ctx.wizard.next();
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
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
      if (query === "back_from_quote") {
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
        title = MODELS.pairs.quote.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.quote.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.quote.title
            : ctx.wizard.state.message + MODELS.pairs.quote.title;
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
          { text: "Back ", callback_data: "back_from_quote" },
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

function limitStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to limit");
      let query;
      let shouldEdit = true;
      let title = "";
      let limit = "";

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          if (
            isNumeric(ctx.message.text) &&
            parseInt(ctx.message.text) <= MODELS.pairs.limit.max &&
            parseInt(ctx.message.text) >= MODELS.pairs.limit.min
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            limit = ctx.message.text;
            ctx.wizard.state.data.limit = parseInt(limit);
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message = MODELS.pairs.limit.limitWarning + "\n";
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
      if (query === "back_from_limit") {
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
        title = MODELS.pairs.limit.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.limit.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.limit.title
            : ctx.wizard.state.message + MODELS.pairs.limit.title;
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
          { text: "Back ", callback_data: "back_from_limit" },
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

function thresholdStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to threshold");
      let query;
      let shouldEdit = true;
      let title = "";
      let threshold = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          if (
            isNumeric(ctx.message.text) &&
            parseInt(ctx.message.text) <= MODELS.pairs.threshold.max &&
            parseInt(ctx.message.text) >= MODELS.pairs.threshold.min
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            threshold = ctx.message.text;
            ctx.wizard.state.data.threshold = parseInt(threshold);
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.pairs.threshold.limitWarning + "\n";
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
      if (query === "back_from_threshold") {
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
        title = MODELS.pairs.threshold.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.threshold.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.threshold.title
            : ctx.wizard.state.message + MODELS.pairs.threshold.title;
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
          { text: "Back ", callback_data: "back_from_threshold" },
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

function priceStrategyTypeStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to priceStrategyType");
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
        if (checkOptions(MODELS.pairs.priceStrategyType.options, query)) {
          ctx.wizard.next();
          ctx.wizard.state.data.priceStrategyType = query;
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }
        console.log(query);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_priceStrategyType") {
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
        title = MODELS.pairs.priceStrategyType.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.priceStrategyType.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.priceStrategyType.title
            : ctx.wizard.state.message + MODELS.pairs.priceStrategyType.title;
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
        for (let option of MODELS.pairs.priceStrategyType.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_priceStrategyType" },
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

function priceStrategyThresholdStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to priceStrategyThreshold");
      let query;
      let shouldEdit = true;
      let title = "";
      let priceStrategyThreshold = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          if (
            isNumeric(ctx.message.text) &&
            parseInt(ctx.message.text) <=
              MODELS.pairs.priceStrategyThreshold.max &&
            parseInt(ctx.message.text) >=
              MODELS.pairs.priceStrategyThreshold.min
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            priceStrategyThreshold = ctx.message.text;
            ctx.wizard.state.data.priceStrategyThreshold = parseInt(
              priceStrategyThreshold
            );
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.pairs.priceStrategyThreshold.limitWarning + "\n";
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
      if (query === "back_from_priceStrategyThreshold") {
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
        title = MODELS.pairs.priceStrategyThreshold.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.priceStrategyThreshold.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.priceStrategyThreshold.title
            : ctx.wizard.state.message +
              MODELS.pairs.priceStrategyThreshold.title;
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
          { text: "Back ", callback_data: "back_from_priceStrategyThreshold" },
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

function buySellDiffStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to buySellDiff");
      let query;
      let shouldEdit = true;
      let title = "";
      let buySellDiff = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          if (
            isNumeric(ctx.message.text) &&
            parseInt(ctx.message.text) <= MODELS.pairs.buySellDiff.max &&
            parseInt(ctx.message.text) >= MODELS.pairs.buySellDiff.min
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            buySellDiff = ctx.message.text;
            ctx.wizard.state.data.buySellDiff = parseInt(buySellDiff);
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.pairs.buySellDiff.limitWarning + "\n";
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
      if (query === "back_from_buySellDiff") {
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
        title = MODELS.pairs.buySellDiff.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.buySellDiff.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.buySellDiff.title
            : ctx.wizard.state.message + MODELS.pairs.buySellDiff.title;
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
          { text: "Back ", callback_data: "back_from_buySellDiff" },
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

function orderTimeoutStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to orderTimeout");
      let query;
      let shouldEdit = true;
      let title = "";
      let orderTimeout = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          if (
            isNumeric(ctx.message.text) &&
            parseInt(ctx.message.text) <= MODELS.pairs.orderTimeout.max &&
            parseInt(ctx.message.text) >= MODELS.pairs.orderTimeout.min
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            orderTimeout = ctx.message.text;
            ctx.wizard.state.data.orderTimeout = parseInt(orderTimeout);
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.pairs.orderTimeout.limitWarning + "\n";
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
      if (query === "back_from_orderTimeout") {
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
        title = MODELS.pairs.orderTimeout.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.pairs.orderTimeout.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.pairs.orderTimeout.title
            : ctx.wizard.state.message + MODELS.pairs.orderTimeout.title;
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
          { text: "Back ", callback_data: "back_from_orderTimeout" },
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

function confirmationStep() {
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
        let priceStrategy = {
          type: ctx.wizard.state.data.priceStrategyType,
          threshold: ctx.wizard.state.data.priceStrategyThreshold,
        };
        let dataToSave = {};
        dataToSave["base"] = ctx.wizard.state.data.base;
        dataToSave["quote"] = ctx.wizard.state.data.quote;
        dataToSave["limit"] = ctx.wizard.state.data.limit;
        dataToSave["threshold"] = ctx.wizard.state.data.threshold;
        dataToSave["orderTimeout"] = ctx.wizard.state.data.orderTimeout;
        dataToSave["buySellDiff"] = ctx.wizard.state.data.buySellDiff;
        dataToSave["priceStrategy"] = priceStrategy;
        dataToSave["pair"] =
          ctx.wizard.state.data.base + "-" + ctx.wizard.state.data.quote;
        dataToSave["symbol"] =
          ctx.wizard.state.data.base + ctx.wizard.state.data.quote;
        dataToSave["buySellDiff"] = ctx.wizard.state.data.buySellDiff;
        dataToSave["engineName"] = ctx.wizard.state.data.engine;
        dataToSave["engine"] = ctx.wizard.state.data.engine;
        dataToSave["sandbox"] = true;
        dataToSave["enable"] = false;

        await addNewPair(dataToSave, ctx.wizard.state.adminId);

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
        dataToPrint =
          dataToPrint +
          MODELS.pairs[key].name +
          " : " +
          ctx.wizard.state.data[key] +
          "\n";
      }

      title =
        ctx.wizard.state.message === undefined
          ? MODELS.pairs.confirmation.title + dataToPrint
          : ctx.wizard.state.message +
            MODELS.pairs.confirmation.title +
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
        for (let option of MODELS.pairs.confirmation.options) {
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
      if (query === "yes") {
        let priceStrategy = {};
        if (ctx.wizard.state.data?.priceStrategyType) {
          priceStrategy.type = ctx.wizard.state.data.priceStrategyType;
          // get the threshold from the database which will not store as an undefied
          priceStrategy.threshold =
            ctx.wizard.state.pair?.priceStrategy.threshold;
        }

        if (ctx.wizard.state.data?.priceStrategyThreshold) {
          priceStrategy.threshold =
            ctx.wizard.state.data.priceStrategyThreshold;
          priceStrategy.type = ctx.wizard.state.pair?.priceStrategy.type;
        }

        if (!priceStrategy.type && !priceStrategy.threshold) {
          console.log(priceStrategy);
          priceStrategy = undefined;
        }

        // let priceStrategy = {
        //   type: ctx.wizard.state.data.priceStrategyType,
        //   threshold: ctx.wizard.state.data.priceStrategyThreshold,
        // };
        let dataToSave = {};
        dataToSave["base"] = ctx.wizard.state.data.base;
        dataToSave["quote"] = ctx.wizard.state.data.quote;
        dataToSave["limit"] = ctx.wizard.state.data.limit;
        dataToSave["threshold"] = ctx.wizard.state.data.threshold;
        dataToSave["orderTimeout"] = ctx.wizard.state.data.orderTimeout;
        dataToSave["buySellDiff"] = ctx.wizard.state.data.buySellDiff;
        dataToSave["priceStrategy"] = priceStrategy;
        dataToSave["pair"] =
          ctx.wizard.state.data.base + "-" + ctx.wizard.state.data.quote;
        dataToSave["symbol"] =
          ctx.wizard.state.data.base + ctx.wizard.state.data.quote;
        dataToSave["buySellDiff"] = ctx.wizard.state.data.buySellDiff;
        dataToSave["engineName"] = ctx.wizard.state.data.engine;
        dataToSave["engine"] = ctx.wizard.state.data.engine;
        dataToSave["sandbox"] = true;
        dataToSave["enable"] = false;

        console.log(dataToSave);
        await updatePair(
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
        dataToPrint =
          dataToPrint +
          MODELS.pairs[key].name +
          " : " +
          ctx.wizard.state.data[key] +
          "\n";
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

function displayInformationsStep(dataType) {
  let step = async (ctx) => {
    try {
      console.log("coming to display data step");
      let query;
      let shouldEdit = true;
      let title = "";

      // if the text sent, we need to remove the statment and display error to be exist in the message
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

      if (query === "back_from_displayingInformation") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }

      const pair = await getPair(
        ctx.wizard.state.pairId,
        ctx.wizard.state.adminId
      );

      if (pair) {
        ctx.wizard.state.data.engine = pair.engine;
        ctx.wizard.state.data.base = pair.base;
        ctx.wizard.state.data.quote = pair.quote;
      }

      if (dataType === "priceStrategy") {
        ctx.wizard.state.data.priceStrategyType = pair.priceStrategy.type;
        ctx.wizard.state.data.priceStrategyThreshold =
          pair.priceStrategy.threshold;
      }

      if (dataType === "Status") {
        const status = await getStatusesData(
          ctx.wizard.state.adminId,
          ctx.wizard.state.pairId
        );

        // Check if the status exist // to be edit to the same way
        if (!status) {
          throw new Error(
            "There are no status for the pair, Please add a status or check the admin"
          );
        }
        ctx.wizard.state.data.status = status[0].data.status;
        ctx.wizard.state.data.reason = status[0].data.reason;
      }

      if (dataType === "reportConfig") {
        const reports = await getReports(
          ctx.wizard.state.adminId,
          ctx.wizard.state.pairId
        );
        // HANDLE IF YOU HAVE NO REPORTS IN THE DATA BASE

        ctx.wizard.state.data.reports = reports;
      }

      let dataToPrint = "";
      const dataKeys = Object.keys(ctx.wizard.state.data);

      console.log(`keys`, dataKeys);
      console.log(`data to display`, ctx.wizard.state.data);
      for (let key of dataKeys) {
        if (key === "status" || key === "reason") {
          dataToPrint =
            dataToPrint +
            MODELS.status[key]?.name +
            " : " +
            ctx.wizard.state.data[key] +
            "\n";
        } else if (key === "reports") {
          // store the reports data
          let reports = ctx.wizard.state.data.reports;
          // reports key to discharge the reports values
          let reportsKey;
          dataToPrint += `\n`;
          // if report exist
          if (reports) {
            for (let i = 0; i < reports.length; i++) {
              // array of the report keys
              reportsKey = Object.keys(reports[i].data);

              for (let key of reportsKey) {
                console.log(key);
                // pair and sandbox must be ignored from the models because its display only they added auto
                if (key === "pair" || key === "sandbox") {
                  continue;
                  // dataToPrint =
                  //   dataToPrint + key + " : " + reports[i].data[key] + "\n";
                } else {
                  dataToPrint =
                    dataToPrint +
                    MODELS.activityReport[key].name +
                    " : " +
                    reports[i].data[key] +
                    "\n";
                }
              }
              dataToPrint += "\n";
            }
          }
        } else {
          dataToPrint =
            dataToPrint +
            MODELS.pairs[key]?.name +
            " : " +
            ctx.wizard.state.data[key] +
            "\n";
        }
      }

      title =
        ctx.wizard.state.message === undefined
          ? MODELS.pairs.display.title + `\n` + dataToPrint
          : ctx.wizard.state.message + MODELS.pairs.display.title + dataToPrint;
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
        // for (let option of MODELS.pairs.confirmation.options) {
        //   keyboard_options[0].push({
        //     text: option.name,
        //     callback_data: option.id,
        //   });
        // }
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_displayingInformation" },
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
  selectPairStep,
  engineStep,
  baseStep,
  quoteStep,
  limitStep,
  thresholdStep,
  priceStrategyTypeStep,
  priceStrategyThresholdStep,
  buySellDiffStep,
  orderTimeoutStep,
  confirmationStep,
  updateConfirmationStep,
  displayInformationsStep,
};
