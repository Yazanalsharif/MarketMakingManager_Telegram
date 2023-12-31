require("dotenv").config({ path: "./config/.env" });
const { Scenes, session } = require("telegraf");
const { bot, notificationBot } = require("./bot");
const server = require("./server");
const chalk = require("chalk");

const { isNotAuthorized } = require("./middlewares/authorized");
const { signInView } = require("./view/main");
const { menuConfig } = require("./controllers/marketMakerController");

const deleteMessage = require("./utils/deleteMessage");

const {
  createReportScene,
  getReportScene,
  deleteReportScene,
  updateReportScene,
} = require("./scenes/reportScenes");

const { updateStatusScene, getStatusScene } = require("./scenes/statusScenes");

const {
  addingPairScene,
  getPriceStrategyScene,
  updateStrategyTypeScene,
  updateStrategyThresholdScene,
  amountOrderScene,
  precentOrderScene,
  orderCancelationScene,
  orderGapScene,
  autoRestartScene,
} = require("./scenes/pairsScenes");

const {
  addTradingAccount,
  deleteTradingAccount,
} = require("./scenes/tradingAccountScenes");

const { signin } = require("./scenes/usersScences");

server();

const launchBot = async () => {
  try {
    bot.launch();
    console.log(chalk.white.bgGreenBright.bold(`The bot is launched...`));
  } catch (err) {
    if (err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
};

const launchNotificationBot = async () => {
  try {
    notificationBot.launch();
    console.log(chalk.white.bgBlue.bold(`The Notification bot is launched...`));
  } catch (err) {
    if (err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
};

let stage = new Scenes.Stage([
  amountOrderScene,
  precentOrderScene,
  createReportScene,
  getReportScene,
  deleteReportScene,
  updateReportScene,
  getStatusScene,
  updateStatusScene,
  updateStrategyTypeScene,
  getPriceStrategyScene,
  updateStrategyThresholdScene,
  orderCancelationScene,
  orderGapScene,
  signin,
  addingPairScene,
  addTradingAccount,
  deleteTradingAccount,
  autoRestartScene,
]);

bot.use(async (ctx, next) => {
  try {
    await ctx.sendChatAction("typing");
    next();
  } catch (err) {
    console.log(err.message);
  }
});

// bot.use(async (ctx, next) => {
//   try {
//     deleteMessage(ctx, bot);
//     next();
//   } catch (err) {
//     console.log(err);
//   }
// });

// stage.command("menu", async (ctx) => {
//   try {
//     await menuConfig(ctx, bot);
//   } catch (err) {
//     console.log(`Error: ${err.message}`);
//   }
// });

stage.start(async (ctx) => {
  try {
    ctx.scene.leave();
    const auth = await isNotAuthorized(ctx);

    if (auth !== 0) {
      return await menuConfig(ctx, bot);
    }

    await signInView(ctx, bot);
  } catch (err) {
    ctx.reply(err.message);
    console.log(err);
    await setTimeout(() => {
      let id =
        ctx.update.message?.message_id ||
        ctx.update.callback_query?.message.message_id;
      deleteMessage(ctx, bot, id + 1);
    }, 2000);
  }
});

bot.use(session());
bot.use(stage.middleware()); // Stage middleware

// ********************************* The users operations commands  *************************************
require("./commands/users");
// // addUser command for adding the telegram userName
// bot.command("addUser", async (ctx) => {
//   // the add user function to add the new Manager to the bot database
//   await addUser(ctx, bot);
// });

// // Delete the users from the database
// bot.command("deleteUser", async (ctx) => {
//   await deleteUser(ctx);
// });

// // Get the users with their
// bot.command("getUsers", async (ctx) => {
//   await getUsers(ctx);
// });
// // update the userName of the telegram account
// bot.command("updateUser", async (ctx) => {
//   await updateUserName(ctx);
// });

// ******** The config of the Market Maker

require("./commands/marketMaker");

// bot.command("amount_limit", async (ctx) => {
//   await updateAmountLimit(ctx);
// });

// bot.command("transaction_rate_limit", async (ctx) => {
//   await updateTransactionRateLimit(ctx);
// });

// bot.command("Getbalances", async (ctx) => {
//   await getBalances(ctx);
// });

// bot.command("users", async (ctx) => {
//   await updateUserAccount(ctx);
// });

// bot.command("engines", async (ctx) => {
//   console.log(url);
//   await updateEngines(ctx);
// });

// bot.command("configList", async (ctx) => {
//   try {
//     await isAuthorized(ctx);
//     await configBotList(ctx, bot);
//   } catch (err) {
//     errorHandlerBot(ctx, err);
//   }
// });

// bot.command("menu", async (ctx) => {
//   await mainMenu(ctx, bot);
// });

// // ********************************* The inline Keyboards Actions *************************************
// bot.action("limit", async (ctx) => {
//   await limitOrderList(ctx, bot);
// });

// bot.action("configlist", async (ctx) => {
//   try {
//     await isAuthorized(ctx);
//     await configBotList(ctx, bot);
//   } catch (err) {
//     errorHandlerBot(ctx, err);
//   }
// });

// bot.action("amount", Scenes.Stage.enter("amountOrderScene"));

// bot.action("precent", Scenes.Stage.enter("precentOrderScene"));

// bot.action("activityReport", async (ctx) => {
//   await activityReportList(ctx, bot);
// });

// bot.action("createActivitReport", async (ctx) => {
//   await isAuthorized(ctx);
//   Scenes.Stage.enter("createReportScene");
// });
// // add the other scenes related to the activities report

// bot.action("statusReport", async (ctx) => {
//   await statusReportList(ctx, bot);
// });

// bot.action("getStatus", async (ctx) => {
//   await getStatus(ctx);
// });

// bot.action("updateStatus", Scenes.Stage.enter("updateStatusScene"));

// bot.action("sign-in", Scenes.Stage.enter("signin"));

// ********************************* Hears function to handle Entering the value  *************************************

// Catch the Errors
bot.catch((err, ctx) => {
  console.log("Test error here");
  console.log(`Ooops, encountered an error for`, err);
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

launchBot();
launchNotificationBot();
module.exports = { bot };
