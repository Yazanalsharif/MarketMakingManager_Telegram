const chalk = require("chalk");
const { errorHandlerBot } = require("../utils/errorHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const { amountLimitColloction } = require("../models/botConfig");

// @Description             Change the amount_limit in the botConfig
// access                   Admin
const updateAmountLimit = async (ctx) => {
  try {
    // get the text from the command
    const text = ctx.update.message.text;
    // seperate the data from the telegram command
    const data = text.split(" ");
    // get the collection (command)
    const collection = data[0].substring(1);

    if (!data[1]) {
      throw new ErrorResponse(
        `Please Enter the doc name as the following example\n/amount_limit dailyLimit 1000 false`
      );
    }

    if (!data[2]) {
      throw new ErrorResponse(
        `Please Enter the limit value as a secound paramenter in the command`
      );
    }

    const colcData = {
      collection,
      doc: data[1],
      limit: data[2],
      enable: data[3],
    };

    await amountLimitColloction(colcData);
  } catch (err) {
    console.log(err.message);
    errorHandlerBot(ctx, err);
  }
};

module.exports = { updateAmountLimit };
