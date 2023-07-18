const mainMenuText = `Check the below options`;
const inline_keyboard = [
  [
    { text: "Pairs", callback_data: "pairList" },
    { text: "Auto Start", callback_data: "autoStart" },
  ],
  [
    { text: "Limit Amount", callback_data: "limit" },
    { text: "Activity Report", callback_data: "activityReport" },
  ],

  [
    { text: "Trading Accounts", callback_data: "tradingAccountList" },
    { text: "Status", callback_data: "statusReport" },
  ],
  [{ text: "Price Strategy", callback_data: "priceStrategy" }],
  [
    { text: "Cancelation Timeout", callback_data: "cancelation" },
    { text: "Orders Gap", callback_data: "ordersGap" },
  ],
  [
    {
      text: "Notification",
      callback_data: "notificationBot",
    } /* { text: "Sign out", callback_data: "signout" }*/,
  ],
  [{ text: "Help", callback_data: "mainMenuHelp" }],
];

const signInTitle = `Please click sign in to `;
const signInInlineKeyboard = [
  [{ text: "Sign in", callback_data: "sign-in" }],
  [{ text: "Help", callback_data: "signInHelp" }],
];

const mainMenu = async (ctx, bot) => {
  try {
    await ctx.editMessageText(mainMenuText, {
      reply_markup: {
        inline_keyboard: inline_keyboard,
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, mainMenuText, {
      reply_markup: {
        inline_keyboard: inline_keyboard,
      },
    });
  }
};
const mainMenuEditable = async (ctx, bot) => {
  try {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.wizard.state.messageToEdit,
      0,
      {
        text: mainMenuText,
        inline_message_id: ctx.wizard.state.messageToEdit,
        reply_markup: {
          inline_keyboard: inline_keyboard,
        },
      }
    );
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, mainMenuText, {
      reply_markup: {
        inline_keyboard: inline_keyboard,
      },
    });
  }
};
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

module.exports = { mainMenu, signInView, mainMenuEditable };
