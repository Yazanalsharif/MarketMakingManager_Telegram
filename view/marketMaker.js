// limit OrderList
const limitOrderList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(ctx.chat.id, `Check the below options`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "precent", callback_data: "precent" },
            { text: "amount", callback_data: "amount" },
          ],
          [{ text: "Help", callback_data: "helpLimitList" }],
          [{ text: "Back", callback_data: "backMain" }],
        ],
      },
    });
  } catch (error) {}
};

// Activity Report list
const activityReportList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(
      ctx.chat.id,
      `Please choose from the operations below`,
      {
        reply_markup: {
          inline_keyboard: [
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
          ],
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// Activity Report list
const statusReportList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(
      ctx.chat.id,
      `Please choose from the operations below`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Get", callback_data: "getStatus" },
              { text: "Change", callback_data: "updateStatus" },
            ],
            [{ text: "Help", callback_data: "helpStatusList" }],
            [{ text: "Back", callback_data: "backMain" }],
          ],
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const pairsList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(
      ctx.chat.id,
      `Please choose from the operations below`,
      {
        reply_markup: {
          inline_keyboard: [
            // [
            //   { text: "Create", callback_data: "createActivitReport" },
            //   { text: "Delete", callback_data: "deleteActivityReport" },
            // ],
            [
              { text: "Get", callback_data: "getPairs" },
              // { text: "Edit", callback_data: "editActivityReport" },
            ],
            [{ text: "Help", callback_data: "helpPairs" }],
            [{ text: "Back", callback_data: "backMain" }],
          ],
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const priceStratigyList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(
      ctx.chat.id,
      `Please choose from the operations below`,
      {
        reply_markup: {
          inline_keyboard: [
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
          ],
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const changeStratigyList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(
      ctx.chat.id,
      `Please choose from the operations below`,
      {
        reply_markup: {
          inline_keyboard: [
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
          ],
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  limitOrderList,
  activityReportList,
  statusReportList,
  pairsList,
  priceStratigyList,
  changeStratigyList,
};
