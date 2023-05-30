const chalk = require("chalk");
const { errorHandlerBot } = require("../utils/errorHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const { isAuthorized } = require("../middlewares/authorized");
const deleteMessage = require("../utils/deleteMessage");
const { getAdmin } = require("../models/User");
const { mainMenu } = require("../view/main");
const {
  limitConfig,
  getDocs,
  userBotConfigModule,
  updateEngine,
  updateLimitOrder,
  getAdminsData,
} = require("../models/MarketMakerModule");

const { getStatusesData } = require("../models/Status");

const { getReportConfigData } = require("../models/Report");

const { getPairs } = require("../models/Pairs");

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

// handle the limit order amount.
const limitOrder = async (ctx) => {
  try {
    // new amount
    const amount = parseFloat(ctx.wizard.state.data.amount);
    const precent = parseFloat(ctx.wizard.state.data.precent);
    console.log("The amount is", ctx.wizard.state.data.amount);
    console.log("The precent is", ctx.wizard.state.data.precent);

    const min = amount - (amount * precent) / 100;

    const max = amount + (amount * precent) / 100;

    const data = {
      collection: "limit_order",
      doc: "orders",
      amount,
      max,
      min,
      precent: precent,
    };

    const res = await updateLimitOrder(data);

    if (!res) {
      throw new ErrorResponse(
        `There is an error here, Please contact with the Admin`
      );
    }
  } catch (err) {
    console.log(err);
    errorHandlerBot(ctx, err);
  }
};

const getActivityReports = async (ctx) => {
  try {
    const admin = await getAdmin(ctx);

    const reports = await getAdminsData("Report", admin.id);
    console.log(reports);
    let msg = `The Report configuration belong to the user:`;
    // create a message
    for (let i = 0; i < reports.length; i++) {
      msg += `\n\nDocId: ${reports[i].id}\nuser_address: ${reports[i].data.user_address}\nreport_type: ${reports[i].data.report_type}\ntime: ${reports[i].data.time}\ndestination: ${reports[i].data.dest}`;
    }

    return ctx.reply(msg, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "activityReport" }]],
      },
    });
    // const reports = await getR;
  } catch (err) {
    ctx.reply(err.message, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "activityReport" }]],
      },
    });
  }
};

const getPairData = async (ctx) => {
  try {
    // get the admin Id
    const adminId = await getAdmin(ctx);

    // Get the whole pairs
    const pairs = await getPairs(adminId);

    let msg = `The Pairs informations below`;

    for (let i = 0; i < pairs.length; i++) {
      pairs[i].reportConfiges = await getReportConfigData(adminId, pairs[0].id);
      pairs[i].statuses = await getStatusesData(adminId, pairs[i].id);

      msg += `\n\n\nThe Pair Id: ${pairs[i].id}\nThe Name ${pairs[i].data.pair}\nThe Engine ${pairs[i].data.engine}\nThe Base ${pairs[i].data.base}\nThe Limit ${pairs[i].data.limit}\nThe Precent ${pairs[i].data.precent}%`;

      for (let x = 0; x < pairs[i].reportConfiges.length; x++) {
        msg += `\n\nPairs Report Config id: ${pairs[i].reportConfiges[x].id}\nThe Type: ${pairs[i].reportConfiges[x].data.reportType}\nThe Dist: ${pairs[i].reportConfiges[x].data.reportDest}\nThe Time: ${pairs[i].reportConfiges[x].data.time}`;
      }

      for (let x = 0; x < pairs[i].statuses.length; x++) {
        msg += `\n\nPairs Status id: ${pairs[i].statuses[x].id}\nThe Engine: ${pairs[i].statuses[x].data.engine}\nThe Pair: ${pairs[i].statuses[x].data.pair}\nThe Status: ${pairs[i].statuses[x].data.status}\nThe Reason: ${pairs[i].statuses[x].data.reason}`;
      }
    }

    ctx.reply(msg, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "pairList" }]],
      },
    });

    // console.log(pairs);
    // pairs.foreEach(async (pair) => {
    //   reportSnapshot = await getReportConfig(adminId, pair.id);
    //   statusSnapshot = await getStatuses(adminId, pair.id);
    //   pair.reportData.push({
    //     id: reportSnapshot.id,
    //     data: reportSnapshot.data(),
    //   });

    //   pair.statusData.push({
    //     id: statusSnapshot.id,
    //     data: statusSnapshot.data(),
    //   });
    // });
  } catch (err) {
    ctx.reply(err.message, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "pairList" }]],
      },
    });
  }
};

const menuConfig = async (ctx, bot) => {
  try {
    await isAuthorized(ctx);
    ctx.scene.leave();
    await mainMenu(ctx, bot);
  } catch (err) {
    ctx.reply(err.message);
    await setTimeout(() => {
      let id =
        ctx.update.message?.message_id ||
        ctx.update.callback_query?.message.message_id;
      deleteMessage(ctx, bot, id + 1);
    }, 1000);
  }
};

module.exports = {
  updateAmountLimit,
  updateTransactionRateLimit,
  getBalances,
  updateUserAccount,
  updateEngines,
  limitOrder,
  getActivityReports,
  getPairData,
  menuConfig,
};
