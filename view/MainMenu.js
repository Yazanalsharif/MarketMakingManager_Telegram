const main = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(ctx.chat.id, `Check the below options`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Sign in", callback_data: "sign-in" }],
          [{ text: "Market Maker", callback_data: "configlist" }],
          [{ text: "help", callback_data: "help" }],
        ],
      },
    });
  } catch (err) {}
};

module.exports = { main };
