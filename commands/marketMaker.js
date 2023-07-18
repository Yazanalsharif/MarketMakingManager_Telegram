const { bot, notificationBot } = require("../bot");
const { Scenes } = require("telegraf");
const { mainMenu } = require("../view/main");
const { errorHandlerBot } = require("../utils/errorHandler");
const { isAuthorized } = require("../middlewares/authorized");
const deleteMessage = require("../utils/deleteMessage");
const { MODELS } = require("../models/models");

const {
  getPairData,
  getAccountsData,
  enableNotification,
  disableNotification,
  notificationStart,
} = require("../controllers/marketMakerController");

const {
  limitOrderList,
  activityReportList,
  statusReportList,
  pairsList,
  priceStrategyList,
  changeStrategyList,
  tradingAccountList,
  notificationList,
} = require("../view/marketMaker");
const { models } = require("mongoose");

bot.use(async (ctx, next) => {
  try {
    await isAuthorized(ctx);
    next();
  } catch (err) {
    ctx.reply(err.message);
    setTimeout(() => {
      let id =
        ctx.update.message?.message_id ||
        ctx.update.callback_query?.message.message_id;
      deleteMessage(ctx, bot, id);
      deleteMessage(ctx, bot, id + 1);
    }, 1000);
  }
});

// ********************************* The inline Keyboards Actions *************************************
bot.action("backMain", async (ctx) => {
  try {
    await mainMenu(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});
bot.action("limit", async (ctx) => {
  try {
    await limitOrderList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});
// Auto restart option
bot.action("autoStart", async (ctx) => {
  try {
    await ctx.scene.enter("autoRestartScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("configlist", async (ctx) => {
  try {
    await configBotList(ctx, bot);
  } catch (err) {
    errorHandlerBot(ctx, err);
  }
});

bot.action("tradingAccountList", async (ctx) => {
  try {
    await tradingAccountList(ctx, bot);
  } catch (err) {
    errorHandlerBot(ctx, err);
  }
});

bot.action("amount", async (ctx) => {
  try {
    await ctx.scene.enter("amountOrderScene");
  } catch (err) {
    console.log(err);
  }
});

// trading account here
bot.action("tradingAccountList", async (ctx) => {
  try {
    await tradingAccountList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("addTradingAccount", async (ctx) => {
  try {
    await ctx.scene.enter("addTradingAccount");
  } catch (err) {
    console.log(err);
  }
});

bot.action("deleteTradingAccount", async (ctx) => {
  try {
    await ctx.scene.enter("deleteTradingAccount");
  } catch (err) {
    console.log(err);
  }
});

bot.action("getTradingAccount", async (ctx) => {
  try {
    await getAccountsData(ctx);
  } catch (err) {
    console.log(err);
  }
});

// actions related to the trading account
bot.action("precent", async (ctx) => {
  try {
    await ctx.scene.enter("precentOrderScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("activityReport", async (ctx) => {
  try {
    await activityReportList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("createActivitReport", async (ctx) => {
  try {
    await ctx.scene.enter("createReportScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("getActivityReport", async (ctx) => {
  try {
    await ctx.scene.enter("getReportScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("deleteActivityReport", async (ctx) => {
  try {
    await ctx.scene.enter("deleteReportScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("editActivityReport", async (ctx) => {
  try {
    await ctx.scene.enter("updateReportScene");
  } catch (err) {
    console.log(err);
  }
});

// add the other scenes related to the activities report
bot.action("statusReport", async (ctx) => {
  try {
    await statusReportList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("getStatus", async (ctx) => {
  try {
    await ctx.scene.enter("getStatusScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("updateStatus", async (ctx) => {
  try {
    await ctx.scene.enter("updateStatusScene");
  } catch (err) {
    console.log(err);
  }
});

// ******************************************** Help Actions MarketMaker

bot.action("mainMenuHelp", async (ctx) => {
  let mainHelp;
  try {
    const buySellDiff = MODELS.pairs.buySellDiff;
    const orderTimeout = MODELS.pairs.orderTimeout;
    const mainHelp = `Market Maker Manager\n\nThe telegram bot is one of the market maker features which you will be able to manage the market maker through it\n\n${orderTimeout.name}: ${orderTimeout.description}\n\n${buySellDiff.name}: ${buySellDiff.description}\n\nEach menu will has a help button, Please try to read it before interacting with the options`;
    await ctx.editMessageText(mainHelp, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backMain" }]],
      },
    });
  } catch (err) {
    console.log(err.message);
    await bot.telegram.sendMessage(ctx.chat.id, mainHelp, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backMain" }]],
      },
    });
  }
});

bot.action("helpTradingAccount", async (ctx) => {
  let tradingAccountHelp;
  try {
    tradingAccountHelp = `Trading accounts is the accounts that the engine will use to trade a specifc pair.\n\nYou can create the trading account through the exchanges that available to user through the Market Maker.\n\n You can check the exchange docs to figure out how you can create an api accounts. For example if the pair exist in kucoin then you can read the kucoin docs to create the api account to insert it here`;
    await ctx.editMessageText(tradingAccountHelp, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backTradingAccountList" }],
        ],
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, activityReport, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backTradingAccountList" }],
        ],
      },
    });
  }
});

bot.action("helpActivityList", async (ctx) => {
  let activityReport;
  try {
    activityReport = `Pairs activity report:\n\nYou can setup a config to receive reports from the engine at specific time in different periods(daily, monthly), The report will include the whole transactions that made by the engine.\n\nThe time format must be 00:00, otherwise you will not able to add the time`;
    await ctx.editMessageText(activityReport, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backReport" }]],
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, activityReport, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backReport" }]],
      },
    });
  }
});

bot.action("helpStatusList", async (ctx) => {
  let statusHelp;
  try {
    statusHelp = `Status Pairs:\n\nWe can check the pair status, the pair is working fine if the status is (working) and stopped if the status (stopped).\n\nYou can change the status of the pair, the reason will be (Manually)\n\nIf the status changed by the Engine the reason will be attached.`;
    await ctx.editMessageText(statusHelp, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backStatus" }]],
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, statusHelp, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backStatus" }]],
      },
    });
  }
});

bot.action("helpLimitList", async (ctx) => {
  let helpLimit;
  try {
    // console.log(MODELS.pairs.limit.description);
    const limitHelp = MODELS.pairs.limit.description;
    const thresholdHelp = MODELS.pairs.threshold.description;
    helpLimit = `${limitHelp}\n\n${thresholdHelp}`;
    await ctx.editMessageText(helpLimit, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backLimit" }]],
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, helpLimit, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backLimit" }]],
      },
    });
  }
});

bot.action("helpPairs", async (ctx) => {
  let pairHelp;
  try {
    const pairs = MODELS.pairs;
    pairHelp = `Pair List\n\nYou will be able to get the list of the pairs you have with their report configurations and statuses\n\nPairs properties:\n\n${pairs.base.name}: ${pairs.base.description}\n\n${pairs.quote.name}: ${pairs.quote.description}\n\n${pairs.limit.name}: ${pairs.limit.description}\n\n${pairs.threshold.name}: ${pairs.threshold.description}\n\n${pairs.engine.name}: ${pairs.engine.description}`;

    await ctx.editMessageText(pairHelp, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backPair" }]],
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, pairHelp, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backPair" }]],
      },
    });
  }
});

bot.action("helpPriceStrategy", async (ctx) => {
  let priceStrategy;
  try {
    const typeHelp = MODELS.pairs.priceStrategyType.description;
    const thresholdHelp = MODELS.pairs.priceStrategyThreshold.description;
    priceStrategy = `Price Strategy Help\n\n\nPrice strategy type: ${typeHelp}\n\n\n${thresholdHelp}`;
    await ctx.editMessageText(priceStrategy, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backPriceStrategy" }],
        ],
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, priceStrategy, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backPriceStrategy" }],
        ],
      },
    });
  }
});

bot.action("helpStrategyChange", async (ctx) => {
  let helpStrategyChange;
  try {
    helpStrategyChange = `Price strategy type is a direction type, it must be one of the values (Up, Down, Random)\n\nPrice strategy threshold is a precentage, it must be between 0 and 100`;
    await ctx.editMessageText(helpStrategyChange, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backChangeStrategy" }],
        ],
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, helpStrategyChange, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backChangeStrategy" }],
        ],
      },
    });
  }
});

bot.action("helpNotification", async (ctx) => {
  let helpNotification;
  try {
    helpNotification = `Notifications is available through a MarketMaker notification bot.\n\nClick on Enable button then the link will be sent, Start the notification bot by clicking on the link and then click on the button start there.\n\nIf you disabled the notification and then enable it then there are no need to start the notification bot again`;
    await ctx.editMessageText(helpNotification, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backNotification" }],
        ],
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, helpStrategyChange, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backChangeStrategy" }],
        ],
      },
    });
  }
});

//  ******************************************** Notification Start
bot.action("notificationBot", async (ctx) => {
  try {
    await notificationList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

// enable notifications
bot.action("enableNotification", async (ctx) => {
  try {
    await enableNotification(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

// disable notification
bot.action("disableNotification", async (ctx) => {
  try {
    await disableNotification(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

//  ******************************************** Notification End

//  ******************************************** Pairs Functions
bot.action("pairList", async (ctx) => {
  try {
    await pairsList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("addNewPair", async (ctx) => {
  try {
    await ctx.scene.enter("addingPairScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("getPairs", async (ctx) => {
  try {
    // the get pairs function
    await getPairData(ctx);
  } catch (err) {
    console.log(err);
  }
});

//  ******************************************** Price Strategies Functions

bot.action("priceStrategy", async (ctx) => {
  try {
    // get the list of the available operations related with the price strategy
    await priceStrategyList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("getPriceStrategies", async (ctx) => {
  try {
    await ctx.scene.enter("getPriceStrategyScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("changePriceStrategies", async (ctx) => {
  try {
    await changeStrategyList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("changeStrategyType", async (ctx) => {
  try {
    await ctx.scene.enter("updateStrategyTypeScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("changeStrategyThreshold", async (ctx) => {
  try {
    await ctx.scene.enter("updateStrategyThresholdScene");
  } catch (err) {
    console.log(err);
  }
});

//  ******************************************** Orders Gab and Cencelation orders Functions

// The scenes will be exist in the pair scenes due to the values here is connected directly with the pair
bot.action("ordersGap", async (ctx) => {
  try {
    await ctx.scene.enter("orderGapScene");
  } catch (err) {
    console.log(err);
  }
});

bot.action("cancelation", async (ctx) => {
  try {
    await ctx.scene.enter("orderCancelationScene");
  } catch (err) {
    console.log(err);
  }
});

// ******************************************** Back Functions

// delete back main and call the main callback data for each of the following properties
bot.action("backMain", async (ctx) => {
  try {
    await mainMenu(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("backLimit", async (ctx) => {
  try {
    await limitOrderList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("backStatus", async (ctx) => {
  try {
    await statusReportList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("backTradingAccountList", async (ctx) => {
  try {
    await tradingAccountList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("backReport", async (ctx) => {
  try {
    await activityReportList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("backPair", async (ctx) => {
  try {
    await pairsList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("backPriceStrategy", async (ctx) => {
  try {
    await priceStrategyList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("backChangeStrategy", async (ctx) => {
  try {
    await changeStrategyList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("backNotification", async (ctx) => {
  try {
    await notificationList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

// Notification Bot commands
notificationBot.start(async (ctx) => {
  try {
    await notificationStart(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});
