const { Telegraf, Scenes, session } = require("telegraf");

const bot = new Telegraf(process.env.BOT_KEY, { polling: true });

module.exports = bot;
