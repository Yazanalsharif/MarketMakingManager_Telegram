const chalk = require("chalk");

const { isAuthorized } = require("../middlewares/authorized");
// const deleteMessage = require("../utils/deleteMessage");
const { getAdmin, getUserByUserName } = require("../models/User");
const { mainMenu } = require("../view/main");

const { getStatusesData } = require("../models/Status");
const { getReports } = require("../models/Report");
const { getAccounts } = require("../models/TradingAccounts");

const { getPairs } = require("../models/Pairs");
const { getEngines } = require("../models/engines");

const { MODELS } = require("../models/models");
const {
  updateNotification,
  getNotifications,
} = require("../models/notification");

// // @Description             Change the amount_limit in the botConfig
// // access                   Admin
// const updateAmountLimit = async (ctx) => {
//   try {
//     await isAuthorized(ctx);
//     // get the text from the command
//     const text = ctx.update.message.text;
//     // seperate the data from the telegram command
//     const data = text.split(" ");
//     // get the collection (command)
//     const collection = data[0].substring(1);

//     if (!data[1]) {
//       throw new ErrorResponse(
//         `Please Enter the doc name as the following example\n/amount_limit dailyLimit 1000 false`
//       );
//     }

//     if (!data[2]) {
//       throw new ErrorResponse(
//         `Please Enter the limit value as a secound paramenter in the command`
//       );
//     }

//     const colcData = {
//       collection,
//       doc: data[1],
//       limit: data[2],
//       enable: data[3],
//     };

//     const res = await limitConfig(colcData);

//     if (!res._writeTime) {
//       throw new ErrorResponse(
//         "ServerError: The data didn't updated Please try again later"
//       );
//     }

//     return ctx.reply(
//       `The data has been updated in doc ${colcData.doc}. The new limit is ${colcData.limit}`
//     );
//   } catch (err) {
//     console.log(err);
//     errorHandlerBot(ctx, err);
//   }
// };

// // @Description             Change the transaction_rate_limit in the botConfig
// // access                   Admin
// const updateTransactionRateLimit = async (ctx) => {
//   try {
//     // get the text from the command and
//     const text = ctx.update.message.text.toLowerCase();
//     // seperate the data from the telegram command
//     const data = text.split(" ");
//     // get the collection (command)
//     const collection = data[0].substring(1);

//     await isAuthorized(ctx);

//     if (!data[1]) {
//       throw new ErrorResponse(
//         `Please Enter the doc name as the following example\n/amount_limit dailyLimit 1000 false`
//       );
//     }

//     if (!data[2]) {
//       throw new ErrorResponse(
//         `Please Enter the limit value as a secound paramenter in the command`
//       );
//     }

//     const colcData = {
//       collection,
//       doc: data[1],
//       limit: data[2],
//       enable: data[3],
//     };

//     const res = await limitConfig(colcData);

//     console.log(res);
//     if (!res._writeTime) {
//       throw new ErrorResponse(
//         "ServerError: The data didn't updated Please try again later"
//       );
//     }

//     return ctx.reply(
//       `The data has been updated in doc ${colcData.doc}. The new limit is ${colcData.limit}`
//     );
//   } catch (err) {
//     console.log(err);
//     errorHandlerBot(ctx, err);
//   }
// };

// // @Description             Get the balances from the accounts
// // access                   Admin
// const getBalances = async (ctx) => {
//   try {
//     await isAuthorized(ctx);

//     const docs = await getDocs("balance");

//     let message = "";

//     for (let i = 0; i < docs.length; i++) {
//       console.log(docs[i].id);
//       message += `${docs[i].id}\n\n`;
//       // we have to update it to finish the other values
//       for (let x = 0; x < docs[i].docsData.data.length; x++) {
//         console.log(docs[i].docsData.data[x]);
//         message += `Balance: ${docs[i].docsData.data[x].balance}\nAvailable: ${docs[i].docsData.data[x].available}\ncurrency: ${docs[i].docsData.data[x].currency}\n\n\n`;
//       }
//       console.log("***********************");
//       message += `***********************\n`;
//     }

//     ctx.reply(message);
//   } catch (err) {
//     console.log(err);
//     errorHandlerBot(ctx, err);
//   }
// };
// // update the accounts in the MM configurations. Which the accounts currently is a users
// const updateUserAccount = async (ctx) => {
//   try {
//     await isAuthorized(ctx);
//     // get the text from the command
//     const text = ctx.update.message.text;
//     // seperate the data from the telegram command
//     const data = text.split(" ");
//     // get the collection (command)
//     const collection = data[0].substring(1);

//     if (!data[1]) {
//       throw new ErrorResponse(
//         `Please Enter the doc name as the following example\n/amount_limit dailyLimit 1000 false`
//       );
//     }

//     if (!data[2]) {
//       throw new ErrorResponse(
//         `Please Enter the value as a secound paramenter in the command. The value Must be true or false`
//       );
//     }

//     if (data[2] != "true" && data[2] != "false") {
//       throw new ErrorResponse(
//         `Please Enter the value as a secound paramenter in the command. The value Must be true or false`
//       );
//     }

//     const colcData = {
//       collection,
//       doc: data[1],
//       enable: data[2],
//     };

//     const res = await userBotConfigModule(colcData);

//     if (!res._writeTime) {
//       throw new ErrorResponse(
//         "ServerError: The data didn't updated Please try again later"
//       );
//     }

//     return ctx.reply(`The data has been updated in doc ${colcData.doc}.`);
//   } catch (err) {
//     console.log(err);
//     errorHandlerBot(ctx, err);
//   }
// };

// const updateEngines = async (ctx) => {
//   try {
//     await isAuthorized(ctx);
//     // get the text from the command
//     const text = ctx.update.message.text;
//     // seperate the data from the telegram command
//     const data = text.split(" ");
//     // get the collection (command)
//     const collection = data[0].substring(1);
//     // the doc id
//     if (!data[1]) {
//       throw new ErrorResponse(
//         `Please Enter the doc name as the following example\n/engine docId name prefix enable`
//       );
//     }

//     const colcData = {
//       collection,
//       doc: data[1],
//       name: data[2],
//       prefix: data[3],
//       enable: data[4],
//     };

//     console.log(colcData);

//     const res = await updateEngine(colcData);

//     if (!res._writeTime) {
//       throw new ErrorResponse(
//         "ServerError: The data didn't updated Please try again later"
//       );
//     }

//     return ctx.reply(`The data has been updated in doc ${colcData.doc}.`);
//   } catch (err) {
//     console.log(err);
//     errorHandlerBot(ctx, err);
//   }
// };

// handle the limit order amount.
// const limitOrder = async (ctx) => {
//   try {
//     // new amount
//     const amount = parseFloat(ctx.wizard.state.data.amount);
//     const precent = parseFloat(ctx.wizard.state.data.precent);
//     console.log("The amount is", ctx.wizard.state.data.amount);
//     console.log("The precent is", ctx.wizard.state.data.precent);

//     const min = amount - (amount * precent) / 100;

//     const max = amount + (amount * precent) / 100;

//     const data = {
//       collection: "limit_order",
//       doc: "orders",
//       amount,
//       max,
//       min,
//       precent: precent,
//     };

//     const res = await updateLimitOrder(data);

//     if (!res) {
//       throw new ErrorResponse(
//         `There is an error here, Please contact with the Admin`
//       );
//     }
//   } catch (err) {
//     console.log(err);
//     errorHandlerBot(ctx, err);
//   }
// };

// const getActivityReports = async (ctx) => {
//   try {
//     const admin = await getAdmin(ctx);

//     const reports = await getAdminsData("Report", admin.id);
//     console.log(reports);
//     let msg = `The Report configuration belong to the user:`;
//     // create a message
//     for (let i = 0; i < reports.length; i++) {
//       msg += `\n\nDocId: ${reports[i].id}\nuser_address: ${reports[i].data.user_address}\nreport_type: ${reports[i].data.report_type}\ntime: ${reports[i].data.time}\ndestination: ${reports[i].data.dest}`;
//     }

//     return ctx.reply(msg, {
//       reply_markup: {
//         inline_keyboard: [[{ text: "Back", callback_data: "activityReport" }]],
//       },
//     });
//     // const reports = await getR;
//   } catch (err) {
//     ctx.reply(err.message, {
//       reply_markup: {
//         inline_keyboard: [[{ text: "Back", callback_data: "activityReport" }]],
//       },
//     });
//   }
// };

// @Description             Get the pair data
// access                   Admin
const getPairData = async (ctx) => {
  console.log(`List the pairs stage`);
  try {
    // get the admin Id
    const adminId = await getAdmin(ctx);

    // Get the whole pairs
    const pairs = await getPairs(adminId);

    let msg = `The Pairs informations below`;

    // if the pairs doesn't exist then it will display a doesn't exist message
    if (!pairs) {
      msg = "There are no pairs to display, Please create new pair";
      return await ctx.editMessageText(msg, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "pairList" }]],
        },
      });
    }

    for (let i = 0; i < pairs.length; i++) {
      pairs[i].reportConfiges = await getReports(adminId, pairs[0].id);
      pairs[i].statuses = await getStatusesData(adminId, pairs[i].id);

      msg += `\n\nThe pair: ${pairs[i].data.pair}\nThe engine: ${pairs[i].data.engineName}\nThe base: ${pairs[i].data.base}\nThe quote: ${pairs[i].data.quote}\nThe limit: ${pairs[i].data.limit}\nThe threshold: ${pairs[i].data.threshold}%`;

      // Check if the pair and the user has a report config
      if (pairs[i].reportConfiges) {
        msg += `\n\nPair Activity report configs (${pairs[i].reportConfiges.length}):`;
        for (let x = 0; x < pairs[i].reportConfiges.length; x++) {
          msg += `\n\nThe type: ${pairs[i].reportConfiges[x].data.reportType}\nThe dist: ${pairs[i].reportConfiges[x].data.reportDest}\nThe time: ${pairs[i].reportConfiges[x].data.time}`;
        }
      }

      // Check if the pair has a status in database
      if (pairs[i].statuses) {
        msg += `\n\nPair (${pairs[i].data.pair}) Status:\n`;
        for (let x = 0; x < pairs[i].statuses.length; x++) {
          msg += `The status: ${pairs[i].statuses[x].data.status}\nThe reason: ${pairs[i].statuses[x].data.reason}`;
        }
      }
    }

    await ctx.editMessageText(msg, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "pairList" }]],
      },
    });
  } catch (err) {
    ctx.reply(err.message, {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "pairList" }]],
      },
    });
  }
};

// @Description             Get the accounts data
// access                   Admin
const getAccountsData = async (ctx) => {
  console.log(`Get the accounts data`);
  try {
    // get the admin Id
    const adminId = await getAdmin(ctx);

    // // Get the whole pairs
    // const pairs = await getPairs(adminId);

    let msg = `The Accounts informations below\n\n`;

    const accounts = await getAccounts(adminId);

    console.log(accounts);

    if (!accounts && accounts?.length !== 0) {
      msg += `There are no accounts belong to you`;
    } else {
      for (let account of accounts) {
        msg += `Platfrom: ${account.data.platform}\nName: ${account.data.user}\n\n`;
      }
    }

    await ctx.editMessageText(msg, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "tradingAccountList" }],
        ],
      },
    });
  } catch (err) {
    ctx.reply(err.message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back", callback_data: "tradingAccountList" }],
        ],
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
    // await setTimeout(() => {
    //   let id =
    //     ctx.update.message?.message_id ||
    //     ctx.update.callback_query?.message.message_id;
    //   // deleteMessage(ctx, bot, id + 1);
    // }, 1000);
  }
};
// this function for enabling the notification
const enableNotification = async (ctx, bot) => {
  try {
    let title = `Notification will be send from another telegram bot.\n\nPlease click to the below link and start the notification bot.\nt.me/NotificiationTest_bot\n\n`;
    let enableInlineKeyboard = [
      [{ text: "Back", callback_data: "notificationBot" }],
    ];
    await ctx.editMessageText(title, {
      reply_markup: {
        inline_keyboard: enableInlineKeyboard,
      },
    });
    // get the admin id
    const adminId = await getAdmin(ctx);
    // get the notification data
    const notify = await getNotifications(adminId);

    if (!notify.data.chat_id_Notifi) {
      return;
    }

    const data = {
      enable: true,
      sandbox: true,
    };
    // update the user
    await updateNotification(data, adminId);
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, err.message, {
      reply_markup: {
        inline_keyboard: inline_keyboard,
      },
    });
  }
};

// This function for disabling the notification
const disableNotification = async (ctx, bot) => {
  try {
    const adminId = await getAdmin(ctx);

    const data = {
      enable: false,
      sandbox: true,
    };
    // update the user
    await updateNotification(data, adminId);

    let title = `The Notification has been disabled.\n\nYou can enable it by click on enable button in the Notification Menu.\n\nThere are no need to start the notification bot if you started it in the previous short of time`;
    let disableInlineKeyboard = [
      [{ text: "Back", callback_data: "notificationBot" }],
    ];
    await ctx.editMessageText(title, {
      reply_markup: {
        inline_keyboard: disableInlineKeyboard,
      },
    });
  } catch (err) {
    console.log(err);
    await bot.telegram.sendMessage(ctx.chat.id, err.message, {
      reply_markup: {
        inline_keyboard: inline_keyboard,
      },
    });
  }
};

const notificationStart = async (ctx) => {
  try {
    const adminId = await getUserByUserName(ctx.from.username);

    if (!adminId) {
      // The userName doesn't exist in the database
      return ctx.reply(
        `The userName doesn't register in the database, Please signIn to the telegram bot through the below link\nhttps://t.me/YazanTestBot`
      );
    }

    if (!ctx.chat.id) {
      return ctx.reply(
        `You can't start the notifiaction bot now, Please try again later`
      );
    }
    const data = {
      chat_id_Notifi: ctx.chat.id,
      enable: true,
      sandbox: true,
    };
    // update the user
    await updateNotification(data, adminId);

    return ctx.reply(
      "The notification has been enabled.\n\nYou will receive the notification for your market making bot throgh this telegram bot"
    );
  } catch (err) {
    ctx.reply(err.message);
  }
};

module.exports = {
  // updateAmountLimit,
  // updateTransactionRateLimit,
  // getBalances,
  // updateUserAccount,
  // updateEngines,
  // limitOrder,
  // getActivityReports,
  getPairData,
  getAccountsData,
  menuConfig,
  enableNotification,
  disableNotification,
  notificationStart,
};
