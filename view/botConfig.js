const configBotList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(ctx.chat.id, `Check the below options`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Limit_Order", callback_data: "limit" }],
          [{ text: "Activity Report", callback_data: "activityReport" }],
          [{ text: "Status Report", callback_data: "statusReport" }],
        ],
      },
    });
  } catch (err) {}
};

// limit OrderList
const limitOrderList = async (ctx, bot) => {
  try {
    bot.telegram.sendMessage(ctx.chat.id, `Check the below options`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "precent", callback_data: "precent" }],
          [{ text: "amount", callback_data: "amount" }],
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
            [{ text: "Create", callback_data: "createActivitReport" }],
            [{ text: "Delete", callback_data: "deleteActivityReport" }],
            [{ text: "Edit", callback_data: "editActivityReport" }],
            [{ text: "get", callback_data: "getActivityReport" }],
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
            [{ text: "get", callback_data: "getStatus" }],
            [{ text: "change", callback_data: "updateStatus" }],
          ],
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  configBotList,
  limitOrderList,
  activityReportList,
  statusReportList,
};
