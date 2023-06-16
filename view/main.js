const mainMenuText = `Check the below options`;
const inline_keyboard = [
  [{ text: "Trading Accounts", callback_data: "tradingAccountList" }],
  [
    { text: "Limit Amount", callback_data: "limit" },
    { text: "Activity Report", callback_data: "activityReport" },
  ],

  [
    { text: "Status", callback_data: "statusReport" },
    { text: "Pairs", callback_data: "pairList" },
  ],
  [{ text: "Price Stratigy", callback_data: "priceStrategy" }],
  [
    { text: "Cancelation Timeout", callback_data: "cancelation" },
    { text: "Orders Gap", callback_data: "ordersGap" },
  ],
  [{ text: "Help", callback_data: "mainMenuHelp" }],
];

const mainMenu = async (ctx, bot) => {
  try {
    await ctx.editMessageText(mainMenuText, {
      reply_markup: {
        inline_keyboard: inline_keyboard,
      },
    });
  } catch (err) {
    await bot.telegram.sendMessage(ctx.chat.id, mainMenuText, {
      reply_markup: {
        inline_keyboard: inline_keyboard,
      },
    });
  }
};

const signInTitle = `Please click sign in to `;
const signInInlineKeyboard = [
  [{ text: "Sign in", callback_data: "sign-in" }],
  [{ text: "Help", callback_data: "signInHelp" }],
];
const signInView = async (ctx, bot) => {
  try {
    await ctx.editMessageText(signInTitle, {
      reply_markup: {
        inline_keyboard: signInInlineKeyboard,
      },
    });
  } catch (err) {
    await bot.telegram.sendMessage(ctx.chat.id, signInTitle, {
      reply_markup: {
        inline_keyboard: signInInlineKeyboard,
      },
    });
  }
};

module.exports = { mainMenu, signInView };
