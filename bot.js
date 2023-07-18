const { Telegraf, Scenes, session } = require("telegraf");

const bot = new Telegraf(process.env.BOT_KEY, { polling: true });
const notificationBot = new Telegraf(process.env.BOT_KEY_NOTIFICATION, {
  polling: true,
});

module.exports = { bot, notificationBot };
