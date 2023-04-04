require("dotenv").config({ path: "./config/.env" });
const { Telegraf } = require("telegraf");
const server = require("./server");
const chalk = require("chalk");
const connect = require("./config/db");
const firebaseConnect = require("./models/botConfig");
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
} = require("./controllers/botConfig");

server();
connect();

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
  await updateEngines(ctx);
});

bot.on("message", (ctx) => {});

// Catch the Errors
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

launchBot();

module.exports = bot;
