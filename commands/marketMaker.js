const bot = require("../bot");
const { Scenes } = require("telegraf");
const { mainMenu } = require("../view/main");
const { errorHandlerBot } = require("../utils/errorHandler");
const { isAuthorized } = require("../middlewares/authorized");
const deleteMessage = require("../utils/deleteMessage");

const {
  updateAmountLimit,
  updateTransactionRateLimit,
  getBalances,
  updateUserAccount,
  updateEngines,
  getPairData,
} = require("../controllers/marketMakerController");

const {
  limitOrderList,
  activityReportList,
  statusReportList,
  pairsList,
  priceStratigyList,
  changeStratigyList,
} = require("../view/marketMaker");

bot.use(async (ctx, next) => {
  try {
    await isAuthorized(ctx);
    next();
  } catch (err) {
    ctx.reply(err.message);
    await setTimeout(() => {
      let id =
        ctx.update.message?.message_id ||
        ctx.update.callback_query?.message.message_id;
      deleteMessage(ctx, bot, id);
      deleteMessage(ctx, bot, id + 1);
    }, 1000);
  }
});

// bot.command("amount_limit", async (ctx) => {
//   try {
//     await updateAmountLimit(ctx);
//   } catch (err) {
//     console.log(err);
//   }
// });

// bot.command("transaction_rate_limit", async (ctx) => {
//   try {
//     await updateTransactionRateLimit(ctx);
//   } catch (err) {
//     console.log(err);
//   }
// });

// bot.command("Getbalances", async (ctx) => {
//   try {
//     await getBalances(ctx);
//   } catch (err) {
//     console.log(err);
//   }
// });

// bot.command("users", async (ctx) => {
//   try {
//     await updateUserAccount(ctx);
//   } catch (err) {
//     console.log(err);
//   }
// });

// bot.command("engines", async (ctx) => {
//   try {
//     console.log(url);
//     await updateEngines(ctx);
//   } catch (err) {
//     console.log(err);
//   }
// });

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

bot.action("configlist", async (ctx) => {
  try {
    await configBotList(ctx, bot);
  } catch (err) {
    errorHandlerBot(ctx, err);
  }
});
// try {

// } catch (err) {

// }
bot.action("amount", async (ctx) => {
  try {
    await ctx.scene.enter("amountOrderScene");
  } catch (err) {
    console.log(err);
  }
});

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
  try {
    ctx.reply("Help Main Menu here", {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backMain" }]],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

bot.action("helpActivityList", async (ctx) => {
  try {
    ctx.reply("Help Report Menu here", {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backReport" }]],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

bot.action("helpStatusList", async (ctx) => {
  try {
    ctx.reply("Help Status List here", {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backStatus" }]],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

bot.action("helpLimitList", async (ctx) => {
  try {
    ctx.reply("Help limit List here", {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backLimit" }]],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

bot.action("helpPairs", async (ctx) => {
  try {
    ctx.reply("helpPairs List here", {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "backPair" }]],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

bot.action("helpPriceStrategy", async (ctx) => {
  try {
    ctx.reply("helpPriceStrategy List here", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backPriceStrategy" }],
        ],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

bot.action("helpStrategyChange", async (ctx) => {
  try {
    ctx.reply("helpStrategyChange List here", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "backChangeStrategy" }],
        ],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

//  ******************************************** Pairs Functions
bot.action("pairList", async (ctx) => {
  try {
    await pairsList(ctx, bot);
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
    await priceStratigyList(ctx, bot);
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
    await changeStratigyList(ctx, bot);
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
    await priceStratigyList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});

bot.action("backChangeStrategy", async (ctx) => {
  try {
    await changeStratigyList(ctx, bot);
  } catch (err) {
    console.log(err);
  }
});
