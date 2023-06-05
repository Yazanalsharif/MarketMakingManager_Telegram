// limit OrderList
const limitOrderList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(
      ctx.chat.id,
      `Orders Limit List:\n\nPlease choose from the operations below`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "threshold", callback_data: "precent" },
              { text: "amount", callback_data: "amount" },
            ],
            [{ text: "Help", callback_data: "helpLimitList" }],
            [{ text: "Back", callback_data: "backMain" }],
          ],
        },
      }
    );
  } catch (error) {}
};

// Activity Report list
const activityReportList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(
      ctx.chat.id,
      `Trading Activity Report List:\n\nPlease choose from the operations below`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Create", callback_data: "createActivitReport" },
              { text: "Delete", callback_data: "deleteActivityReport" },
            ],
            [
              { text: "Get", callback_data: "getActivityReport" },
              // { text: "Edit", callback_data: "editActivityReport" },
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
      `Status List:\n\nPlease choose from the operations below`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Get Status", callback_data: "getStatus" },
              { text: "Change Status", callback_data: "updateStatus" },
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
      `Pairs List:\n\nPlease choose from the operations below`,
      {
        reply_markup: {
          inline_keyboard: [
            // [
            //   { text: "Create", callback_data: "createActivitReport" },
            //   { text: "Delete", callback_data: "deleteActivityReport" },
            // ],
            [
              { text: "List pairs", callback_data: "getPairs" },
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
      `Price Strategy List:\n\nPlease choose from the operations below`,
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
      `Change Price Strategy List:\n\nPlease choose from the operations below`,
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
