const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");
const { statusReportList } = require("../view/marketMaker");
const bot = require("../bot");
const deleteMessage = require("../utils/deleteMessage");

// const {
//   getDocs,
//   updateStatus,
//   getAdminsData,
// } = require("../models/MarketMakerModule");

const { getStatuses, updateStatus } = require("../models/Status");
const { getPairs, getPair } = require("../models/Pairs");
const { getAdmin } = require("../models/User");

function choosePairStage() {
  const stage = async (ctx) => {
    try {
      let query;

      if (ctx.message?.text) {
        await ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      if (query === "status") {
        await statusReportList(ctx, bot);
        return ctx.scene.leave();
      }

      const adminId = await getAdmin(ctx);

      const pairs = await getPairs(adminId);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.data.pair, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "status" }]);

      await ctx.reply("Please Enter which pair you want to change", {
        reply_markup: {
          inline_keyboard: pairsArray,
        },
      });

      // to store the data and pass it throgh middle ware
      ctx.wizard.state.data = {};

      ctx.wizard.state.adminId = adminId;

      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      await ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
        },
      });
    }
  };

  return stage;
}

const updateStatusScene = new Scenes.WizardScene(
  "updateStatusScene",
  //   first stage
  choosePairStage(),
  //   secound stage
  async (ctx) => {
    let query;
    try {
      // Only inlineKeyboard is working others must doesn't works
      if (ctx.message?.text) {
        await ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
      }

      if (query === "status") {
        await statusReportList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      await ctx.reply(`Please enter the new status`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Working", callback_data: "working" }],
            [{ text: "stop", callback_data: "stopped" }],
            [{ text: "Cancel", callback_data: "status" }],
          ],
        },
      });

      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      await ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
        },
      });
    }
  },
  //third stage
  async (ctx) => {
    try {
      if (ctx.message?.text) {
        await ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      const query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        await ctx.reply(
          "No changes happened, Thanks for interacting with me.",
          {
            reply_markup: {
              inline_keyboard: [
                statuses,
                [{ text: "Back", callback_data: "status" }],
              ],
            },
          }
        );
        return ctx.wizard.next();
      }

      if (query === "status") {
        await statusReportList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.data.status = query;
      ctx.wizard.state.data.reason = "Manually";

      const data = ctx.wizard.state.data;

      const pair = await getPair(
        ctx.wizard.state.pairId,
        ctx.wizard.state.adminId
      );

      if (!pair) {
        throw new Error(`The pair doesn't exist, Please try again later...`);
      }

      await ctx.reply(
        `The Pair: ${pair.pair}\n\nThe engine: ${pair.engineName}\nThe symbol: ${pair.symbol}\nThe status: ${data.status}\nThe threshold: ${data.reason}\n\nPlease confirm the new data`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Yes", callback_data: "Yes" }],
              [{ text: "No", callback_data: "status" }],
            ],
          },
        }
      );

      ctx.wizard.state.pair = pair;

      ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      await ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
        },
      });
    }
  },
  // fourth stage
  async (ctx) => {
    try {
      if (ctx.message?.text) {
        await ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      const query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        await ctx.reply(
          "No changes happened, Thanks for interacting with me.",
          {
            reply_markup: {
              inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
            },
          }
        );
        return ctx.wizard.next();
      }

      if (query === "status") {
        await statusReportList(ctx, bot);
        return ctx.scene.leave();
      }

      const data = ctx.wizard.state.data;

      //   update the data in the firestore
      await updateStatus(
        data,
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      let pair = ctx.wizard.state.pair;

      await ctx.reply(
        `The Pair: ${pair.pair}\n\nThe engine: ${pair.engineName}\nThe symbol: ${pair.symbol}\nThe status: ${data.status}\nThe threshold: ${data.reason}\n\nThe status has been updated`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
          },
        }
      );

      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      await ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
        },
      });

      //   ctx.wizard.cursor(1);
      //   return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const query = ctx.update.callback_query?.data;
      if (ctx.message?.text) {
        await ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      if (query === "status") {
        await statusReportList(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      // reply with the error
      console.log(err);
      await ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
        },
      });
    }
  }
);

// ********************************************** getStatusScene **********************
// //////////////////////////////////////////////////////////////////////////////////////////////////
const getStatusScene = new Scenes.WizardScene(
  "getStatusScene",
  // first stage
  choosePairStage(),
  //   secound stage
  async (ctx) => {
    let query;
    try {
      // Only inlineKeyboard is working others must doesn't works
      if (ctx.message?.text) {
        await ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
      }

      if (query === "status") {
        await statusReportList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      const pair = await getPair(
        ctx.wizard.state.pairId,
        ctx.wizard.state.adminId
      );

      const statusSnapshot = await getStatuses(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      let msg = `The statuses for the pair ${pair.pair}`;

      statusSnapshot.forEach((doc) => {
        msg += `\n\nThe engine: ${pair.engineName}\nThe status: ${
          doc.data().status
        }\nThe reason: ${doc.data().reason}`;
      });

      await ctx.reply(msg, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
        },
      });

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      await ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      const query = ctx.update.callback_query?.data;
      if (ctx.message?.text) {
        await ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      if (query === "status") {
        await statusReportList(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      // reply with the error
      console.log(err);
      await ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
        },
      });
    }
  }
);

// // Get the status and display it in the telegram group
// const getStatus = async (ctx) => {
//   try {
//     const admin = await getAdmin(ctx);

//     const statusData = await getAdminsData("status", admin.id);

//     console.log(statusData);

//     let msg = `The status Data:\n\n`;
//     statusData.forEach((doc) => {
//       msg += `The Doc Id: ${doc.id}\nThe status: ${doc.data.admin_id}\nThe status: ${doc.data.status}\nThe Reason: ${doc.data.reason}\n\n`;
//     });

//     await ctx.reply(msg, {
//       reply_markup: {
//         inline_keyboard: [[{ text: "Back", callback_data: "statusReport" }]],
//       },
//     });
//   } catch (err) {
//     await ctx.reply(err.message, {
//       reply_markup: {
//         inline_keyboard: [[{ text: "Back", callback_data: "statusReport" }]],
//       },
//     });
//   }
// };

module.exports = { getStatusScene, updateStatusScene };
