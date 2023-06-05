const mainMenu = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(ctx.chat.id, `Check the below options`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Limit Amount", callback_data: "limit" },
            { text: "Activity Report", callback_data: "activityReport" },
          ],

          [
            { text: "Status", callback_data: "statusReport" },
            { text: "Pairs", callback_data: "pairList" },
          ],
          [{ text: "Price Strategy", callback_data: "priceStrategy" }],
          [
            { text: "Orders Timeout", callback_data: "cancelation" },
            {
              text: "Buy and Sell difference",
              callback_data: "ordersGap",
            },
          ],
          [{ text: "Help", callback_data: "mainMenuHelp" }],
        ],
      },
    });
  } catch (err) {}
};

const signInView = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(ctx.chat.id, `Check the below options`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Sign in", callback_data: "sign-in" }],
          [{ text: "Help", callback_data: "signInHelp" }],
        ],
      },
    });
  } catch (err) {}
};

module.exports = { mainMenu, signInView };
