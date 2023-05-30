// PAIRS
const pairsListTitle = 'Please choose from the operations below'
const pairsListInlineKeyboard = [
  [{ text: "Add New Pair", callback_data: "addNewPair" }],
  [{ text: "Get", callback_data: "getPairs" }],
  [{ text: "Help", callback_data: "helpPairs" }],
  [{ text: "Back", callback_data: "backMain" }],
]

//Limit orders
const limitOrdersTitle = 'Please choose from the operations below'
const limitOrdersInlineKeyboard = [
  [
    { text: "precent", callback_data: "precent" },
    { text: "amount", callback_data: "amount" },
  ],
  [{ text: "Help", callback_data: "helpLimitList" }],
  [{ text: "Back", callback_data: "backMain" }],
]
//activityReportList
const activityReportTitle = `Please choose from the operations below`
const activityReportInlineKeyboard = [
  [
    { text: "Create", callback_data: "createActivitReport" },
    { text: "Delete", callback_data: "deleteActivityReport" },
  ],
  [
    { text: "Get", callback_data: "getActivityReport" },
    { text: "Edit", callback_data: "editActivityReport" },
  ],
  [{ text: "Help", callback_data: "helpActivityList" }],
  [{ text: "Back", callback_data: "backMain" }],
]
//statusReport
const statusReportTitle = `Please choose from the operations below`
const statusReportInlineKeyboard = [
  [
    { text: "Get", callback_data: "getStatus" },
    { text: "Change", callback_data: "updateStatus" },
  ],
  [{ text: "Help", callback_data: "helpStatusList" }],
  [{ text: "Back", callback_data: "backMain" }],
]
//priceStrategy
const priceStrategyTitle = `Please choose from the operations below`
const priceStrategyInlineKeyboard = [
  [
    {
      text: "Get price strategy",
      callback_data: "getPriceStrategies",
    },
    {
      text: "Change price strategy",
      callback_data: "changePriceStrategies",
    },
  ],
  [{ text: "Help", callback_data: "helpPriceStrategy" }],
  [{ text: "Back", callback_data: "backMain" }],
]
//changeStrategy
const changeStrategyTitle = `Please choose from the operations below`
const changeStrategyInlineKeyboard = [
  [
    {
      text: "Change Type",
      callback_data: "changeStrategyType",
    },
    {
      text: "Change Threshold",
      callback_data: "changeStrategyThreshold",
    },
  ],
  [{ text: "Help", callback_data: "helpStrategyChange" }],
  [{ text: "Back", callback_data: "backPriceStrategy" }],
]
const limitOrderList = async (ctx, bot) => {
  try {
    ctx.editMessageText(limitOrdersTitle, {
      reply_markup: {
        inline_keyboard: limitOrdersInlineKeyboard,
      },
    });
  } catch (error) {
    await bot.telegram.sendMessage(ctx.chat.id, limitOrdersTitle, {
      reply_markup: {
        inline_keyboard: limitOrdersInlineKeyboard,
      },
    });
  }
};

// Activity Report list
const activityReportList = async (ctx, bot) => {
  try {
    await ctx.editMessageText(activityReportTitle,
        {
          reply_markup: {
            inline_keyboard: activityReportInlineKeyboard,
          },
        }
    );
  } catch (error) {
    await bot.telegram.sendMessage(ctx.chat.id, activityReportTitle,
        {
          reply_markup: {
            inline_keyboard: activityReportInlineKeyboard,
          },
        }
    );
  }
};

// Activity Report list
const statusReportList = async (ctx, bot) => {
  try {
    ctx.editMessageText(statusReportTitle,
      {
        reply_markup: {
          inline_keyboard: statusReportInlineKeyboard,
        },
      }
    );
  } catch (error) {
    await bot.telegram.sendMessage(ctx.chat.id, statusReportTitle,
        {
          reply_markup: {
            inline_keyboard: statusReportInlineKeyboard,
          },
        }
    );
  }
};

const pairsList = async (ctx, bot) => {
  try {
    ctx.editMessageText(pairsListTitle,{
      reply_markup: {
        inline_keyboard: pairsListInlineKeyboard,
      },
    });

  } catch (error) {
    await bot.telegram.sendMessage(
      ctx.chat.id,
      pairListTitle,
      {
        reply_markup: {
          inline_keyboard: pairListInlineKeyboard,
        },
      }
    );
  }
};

const priceStrategyList = async (ctx, bot) => {
  try {
    ctx.editMessageText(priceStrategyTitle,
      {
        reply_markup: {
          inline_keyboard: priceStrategyInlineKeyboard,
        },
      }
    );
  } catch (error) {
    await bot.telegram.sendMessage(ctx.chat.id, priceStrategyTitle,
        {
          reply_markup: {
            inline_keyboard: priceStrategyInlineKeyboard,
          },
        }
    );
  }
};

const changeStrategyList = async (ctx, bot) => {
  try {
    await ctx.editMessageText(changeStrategyTitle,
        {
          reply_markup: {
            inline_keyboard: changeStrategyInlineKeyboard,
          },
        }
    );
  } catch (error) {
    await bot.telegram.sendMessage(ctx.chat.id, changeStrategyTitle,
        {
          reply_markup: {
            inline_keyboard: changeStrategyInlineKeyboard,
          },
        }
    );
  }
};

module.exports = {
  limitOrderList,
  activityReportList,
  statusReportList,
  pairsList,
  priceStrategyList,
  changeStrategyList,
};
