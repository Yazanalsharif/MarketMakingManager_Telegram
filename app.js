require("dotenv").config({ path: "./config/.env" });
const { Telegraf, Scenes, session } = require("telegraf");
const server = require("./server");
const chalk = require("chalk");
const { connecteDB } = require("./config/db");
const firebaseConnect = require("./models/botConfig");
const { isAuthorized, isUserExist } = require("./middlewares/authorized");
const {
  addUser,
  deleteUser,
  addChatId,
  getUsers,
  updateUserName,
} = require("./controllers/users");

const {
  updateAmountLimit,
  updateTransactionRateLimit,
  getBalances,
  updateUserAccount,
  updateEngines,
  limitOrder,
} = require("./controllers/botConfig");
const {
  limitOrderList,
  configBotList,
  activityReportList,
  statusReportList,
} = require("./view/botConfig");

const {
  amountOrderScene,
  precentOrderScene,
} = require("./controllers/amountLimitScenes");

const { createReportScene } = require("./controllers/reportScenes");

const { getStatus, updateStatusScene } = require("./controllers/statusScenes");

const { main } = require("./view/MainMenu");

const { signin } = require("./controllers/usersScences");
const { errorHandlerBot } = require("./utils/errorHandler");

server();
connecteDB();

const bot = new Telegraf(process.env.BOT_KEY);

bot.start(async (ctx) => await addChatId(ctx));

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

const stage = new Scenes.Stage([
  amountOrderScene,
  precentOrderScene,
  createReportScene,
  // here must be the others report scenes
  updateStatusScene,
  signin,
]);
bot.use(session());
bot.use(stage.middleware()); // Stage middleware
// ********************************* The users operations commands  *************************************
// addUser command for adding the telegram userName
bot.command("addUser", async (ctx) => {
  // the add user function to add the new Manager to the bot database
  await addUser(ctx, bot);
});

// Delete the users from the database
bot.command("deleteUser", async (ctx) => {
  await deleteUser(ctx);
});

// Get the users with their
bot.command("getUsers", async (ctx) => {
  await getUsers(ctx);
});
// update the userName of the telegram account
bot.command("updateUser", async (ctx) => {
  await updateUserName(ctx);
});

// ******** The config of the Market Maker

// listen the message events
bot.command("amount_limit", async (ctx) => {
  await updateAmountLimit(ctx);
});

bot.command("transaction_rate_limit", async (ctx) => {
  await updateTransactionRateLimit(ctx);
});

bot.command("Getbalances", async (ctx) => {
  await getBalances(ctx);
});

bot.command("users", async (ctx) => {
  await updateUserAccount(ctx);
});

bot.command("engines", async (ctx) => {
  console.log(url);
  await updateEngines(ctx);
});

bot.command("configList", async (ctx) => {
  try {
    await isAuthorized(ctx);
    await configBotList(ctx, bot);
  } catch (err) {
    errorHandlerBot(ctx, err);
  }
});

bot.command("main", async (ctx) => {
  await main(ctx, bot);
});

// ********************************* The inline Keyboards Actions *************************************
bot.action("limit", async (ctx) => {
  await limitOrderList(ctx, bot);
});

bot.action("configlist", async (ctx) => {
  try {
    await isAuthorized(ctx);
    await configBotList(ctx, bot);
  } catch (err) {
    errorHandlerBot(ctx, err);
  }
});

bot.action("amount", Scenes.Stage.enter("amountOrderScene"));

bot.action("precent", Scenes.Stage.enter("precentOrderScene"));

bot.action("activityReport", async (ctx) => {
  await activityReportList(ctx, bot);
});

bot.action("createActivitReport", async (ctx) => {
  await isAuthorized(ctx);
  Scenes.Stage.enter("createReportScene");
});
// add the other scenes related to the activities report

bot.action("statusReport", async (ctx) => {
  await statusReportList(ctx, bot);
});

bot.action("getStatus", async (ctx) => {
  await getStatus(ctx);
});

bot.action("updateStatus", Scenes.Stage.enter("updateStatusScene"));

bot.action("sign-in", Scenes.Stage.enter("signin"));

// ********************************* Hears function to handle Entering the value  *************************************

// Catch the Errors
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for`, err);
});

launchBot();

module.exports = bot;
