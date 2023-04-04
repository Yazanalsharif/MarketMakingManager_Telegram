const chalk = require("chalk");
const { errorHandlerBot } = require("../utils/errorHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const isAuthorized = require("../middlewares/authorized");
const {
  limitConfig,
  getDocs,
  userBotConfigModule,
  updateEngine,
} = require("../models/botConfig");

// @Description             Change the amount_limit in the botConfig
// access                   Admin
const updateAmountLimit = async (ctx) => {
  try {
    await isAuthorized(ctx);
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

    const res = await limitConfig(colcData);

    if (!res._writeTime) {
      throw new ErrorResponse(
        "ServerError: The data didn't updated Please try again later"
      );
    }

    return ctx.reply(
      `The data has been updated in doc ${colcData.doc}. The new limit is ${colcData.limit}`
    );
  } catch (err) {
    console.log(err);
    errorHandlerBot(ctx, err);
  }
};

// @Description             Change the transaction_rate_limit in the botConfig
// access                   Admin
const updateTransactionRateLimit = async (ctx) => {
  try {
    // get the text from the command and
    const text = ctx.update.message.text.toLowerCase();
    // seperate the data from the telegram command
    const data = text.split(" ");
    // get the collection (command)
    const collection = data[0].substring(1);

    await isAuthorized(ctx);

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

    const res = await limitConfig(colcData);

    console.log(res);
    if (!res._writeTime) {
      throw new ErrorResponse(
        "ServerError: The data didn't updated Please try again later"
      );
    }

    return ctx.reply(
      `The data has been updated in doc ${colcData.doc}. The new limit is ${colcData.limit}`
    );
  } catch (err) {
    console.log(err);
    errorHandlerBot(ctx, err);
  }
};

// @Description             Get the balances from the accounts
// access                   Admin
const getBalances = async (ctx) => {
  try {
    await isAuthorized(ctx);

    const docs = await getDocs("balance");

    let message = "";

    for (let i = 0; i < docs.length; i++) {
      console.log(docs[i].id);
      message += `${docs[i].id}\n\n`;
      // we have to update it to finish the other values
      for (let x = 0; x < docs[i].docsData.data.length; x++) {
        console.log(docs[i].docsData.data[x]);
        message += `Balance: ${docs[i].docsData.data[x].balance}\nAvailable: ${docs[i].docsData.data[x].available}\ncurrency: ${docs[i].docsData.data[x].currency}\n\n\n`;
      }
      console.log("***********************");
      message += `***********************\n`;
    }

    ctx.reply(message);
  } catch (err) {
    console.log(err);
    errorHandlerBot(ctx, err);
  }
};
// update the accounts in the MM configurations. Which the accounts currently is a users
const updateUserAccount = async (ctx) => {
  try {
    await isAuthorized(ctx);
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
        `Please Enter the value as a secound paramenter in the command. The value Must be true or false`
      );
    }

    if (data[2] != "true" && data[2] != "false") {
      throw new ErrorResponse(
        `Please Enter the value as a secound paramenter in the command. The value Must be true or false`
      );
    }

    const colcData = {
      collection,
      doc: data[1],
      enable: data[2],
    };

    const res = await userBotConfigModule(colcData);

    if (!res._writeTime) {
      throw new ErrorResponse(
        "ServerError: The data didn't updated Please try again later"
      );
    }

    return ctx.reply(`The data has been updated in doc ${colcData.doc}.`);
  } catch (err) {
    console.log(err);
    errorHandlerBot(ctx, err);
  }
};

const updateEngines = async (ctx) => {
  try {
    await isAuthorized(ctx);
    // get the text from the command
    const text = ctx.update.message.text;
    // seperate the data from the telegram command
    const data = text.split(" ");
    // get the collection (command)
    const collection = data[0].substring(1);
    // the doc id
    if (!data[1]) {
      throw new ErrorResponse(
        `Please Enter the doc name as the following example\n/engine docId name prefix enable`
      );
    }

    const colcData = {
      collection,
      doc: data[1],
      name: data[2],
      prefix: data[3],
      enable: data[4],
    };

    console.log(colcData);

    const res = await updateEngine(colcData);

    if (!res._writeTime) {
      throw new ErrorResponse(
        "ServerError: The data didn't updated Please try again later"
      );
    }

    return ctx.reply(`The data has been updated in doc ${colcData.doc}.`);
  } catch (err) {
    console.log(err);
    errorHandlerBot(ctx, err);
  }
};

module.exports = {
  updateAmountLimit,
  updateTransactionRateLimit,
  getBalances,
  updateUserAccount,
  updateEngines,
};
