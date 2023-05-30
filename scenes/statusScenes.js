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
const { getPairs } = require("../models/Pairs");
const { getAdmin } = require("../models/User");

const updateStatusScene = new Scenes.WizardScene(
  "updateStatusScene",
  //   first stage
  async (ctx) => {
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
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
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
  },
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

      const statusSnapshot = await getStatuses(ctx.wizard.state.adminId, query);

      const statusConfigList = [[]];

      statusSnapshot.forEach((doc) => {
        statusConfigList.push([{ text: doc.id, callback_data: doc.id }]);
      });

      statusConfigList.push([{ text: "Back", callback_data: "status" }]);

      await ctx.reply("Please Enter which status you want to change", {
        reply_markup: {
          inline_keyboard: statusConfigList,
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
  //   third stage
  async (ctx) => {
    try {
      let amount, query;

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

      // // if the user didn't confirmed
      // if (query === `No`) {
      //   ctx.reply("No changes happened, Thanks for interacting with me.", {
      //     reply_markup: {
      //       inline_keyboard: [
      //         statuses,
      //         [{ text: "Back", callback_data: "status" }],
      //       ],
      //     },
      //   });
      //   return ctx.wizard.next();
      // }

      if (query === "status") {
        await statusReportList(ctx, bot);
        return ctx.scene.leave();
      }

      // //   check if the status doc is exist

      // const statusDoc = await getDoc(query);

      ctx.wizard.state.statusId = query;

      await ctx.reply(`Please Enter The New Status`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Working", callback_data: "working" }],
            [{ text: "stop", callback_data: "stopped" }],
            [{ text: "Cancel", callback_data: "status" }],
          ],
        },
      });

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

      await ctx.reply(
        `Please confirm the new data:\n\nId: ${ctx.wizard.state.statusId}\nStatus: ${data.status}\nReason: ${data.reason}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Yes", callback_data: "Yes" }],
              [{ text: "No", callback_data: "status" }],
            ],
          },
        }
      );

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
        ctx.wizard.state.pairId,
        ctx.wizard.state.statusId
      );

      await ctx.reply(
        `The status has been changed\n\nId: ${ctx.wizard.state.statusId}\nStatus: ${data.status}\nReason: ${data.reason}`,
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

const getStatusScene = new Scenes.WizardScene(
  "getStatusScene",
  // first stage
  async (ctx) => {
    try {
      let query;
      console.log(`status stage`);
      if (ctx.message?.text) {
        ctx.reply(`Please choose from the above menu`);
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
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "status" }]);

      await ctx.reply("Select the pair to get the statuses", {
        reply_markup: {
          inline_keyboard: pairsArray,
        },
      });

      // to store the data and pass it throgh middle ware
      ctx.wizard.state.data = {};

      ctx.wizard.state.adminId = adminId;

      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      await ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "status" }]],
        },
      });
    }
  },
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

      const statusSnapshot = await getStatuses(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      let msg = `The statuses for the pair ${ctx.wizard.state.pairId}`;

      statusSnapshot.forEach((doc) => {
        msg += `\n\nThe Statis Id: ${doc.id}\nThe Pair: ${
          doc.data().pair
        }\nThe Engine: ${doc.data().engine}\nThe Status: ${
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
