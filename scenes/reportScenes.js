const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");
const {
  createReport,
  getReportConfig,
  deleteReportConfig,
  getSpecificReport,
} = require("../models/Report");
const { activityReportList } = require("../view/marketMaker");
const bot = require("../bot");
const deleteMessage = require("../utils/deleteMessage");
const { getAdmin } = require("../models/User");
const { getPairs } = require("../models/Pairs");
const { report } = require("../Api/api");
const createReportScene = new Scenes.WizardScene(
  "createReportScene",
  // first stage
  async (ctx) => {
    try {
      let query;

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

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      const adminId = await getAdmin(ctx);

      const pairs = await getPairs(adminId);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "activity" }]);

      ctx.reply("Please Enter which pair you want to change", {
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
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
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
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      ctx.reply(`Choose the way that you want receive a report throgh`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "telegram", callback_data: "telegram" }],
            [{ text: "email", callback_data: "email" }],
            [{ text: "Back", callback_data: "activity" }],
          ],
        },
      });

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
    }
  },
  //   third stage
  async (ctx) => {
    try {
      let query;

      // Only inlineKeyboard is working others must doesn't works
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
      }

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.", {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "email") {
        ctx.wizard.state.data.reportType = "email";
        await ctx.reply("Please Enter The Email address", {
          reply_markup: {
            inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
          },
        });

        ctx.wizard.state.delete = ctx.update.callback_query.message.message_id;

        return ctx.wizard.next();
      }
      ctx.wizard.state.data.reportDest = ctx.chat.username;
      ctx.wizard.state.data.reportType = query;

      ctx.reply(`Please Enter the report type`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "daily", callback_data: "daily" }],
            [{ text: "monthly", callback_data: "monthly" }],
            [{ text: "Cancel", callback_data: "No" }],
          ],
        },
      });
      // pass to the telegram middle ware
      return ctx.wizard.selectStep(ctx.wizard.cursor + 2);
    } catch (err) {
      console.log(err);
    }
  },
  //   third stage
  async (ctx) => {
    try {
      const query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.", {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      if (!ctx.message?.text) {
        ctx.reply(`Please enter the email address`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      if (
        !ctx.message.text
          .trim()
          .match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )
      ) {
        throw new ErrorResponse("Please Enter a valid Email");
      }
      ctx.wizard.state.data.reportDest = ctx.message.text;

      deleteMessage(ctx, bot, ctx.wizard.state.delete + 1);

      ctx.reply(`Please Enter the report type`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "daily", callback_data: "daily" }],
            [{ text: "monthly", callback_data: "monthly" }],
            [{ text: "Cancel", callback_data: "No" }],
          ],
        },
      });

      ctx.wizard.next();
    } catch (err) {
      await ctx.reply(err.message);
      await setTimeout(() => {
        let id = ctx.update.message.message_id + 1;
        deleteMessage(ctx, bot, id);
      }, 1000);
    }
  },
  //fourth stage
  async (ctx) => {
    try {
      if (ctx.message?.text) {
        ctx.reply(`Please choose from the above menu`);
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
        ctx.reply("No changes happened, Thanks for interacting with me.", {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.data.period = query;

      ctx.reply(`Please Enter a specific time to receive the Report at it`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });

      ctx.wizard.state.delete = ctx.update.callback_query.message.message_id;

      // pass to the next middle ware
      return ctx.wizard.next();
    } catch (err) {
      ctx.reply(err.message);
    }
  },
  //   fifth stage
  async (ctx) => {
    try {
      let time = ctx.message?.text;
      const query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.", {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      // when the user use inline keyboard the text is empty and generate an error
      if (time) {
        // store the new data
        ctx.wizard.state.data.time = ctx.message.text + ":00";
      }

      console.log(`the data to be stored`, ctx.wizard.state.data);

      if (isNaN(time) || 23 >= time <= 0) {
        throw new ErrorResponse(`Please Enter the valid number`);
      }

      deleteMessage(ctx, bot, ctx.wizard.state.delete + 1);

      const data = ctx.wizard.state.data;

      // ask for confirmation
      ctx.reply(
        `Please confirm the new data:\n\nDestination: ${data.reportDest}\nReport_Type: ${data.reportType}\nTime: ${data.time}\nperiod: ${data.period}\nAdmin_Id: ${ctx.wizard.state.adminId}\nPairId: ${ctx.wizard.state.pairId}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Yes", callback_data: "Yes" }],
              [{ text: "No", callback_data: "No" }],
            ],
          },
        }
      );

      // pass to the next middle ware
      return ctx.wizard.next();
    } catch (err) {
      console.log("the error is here", err);
      await ctx.reply(err.message);
      await setTimeout(() => {
        let id = ctx.update.message.message_id + 1;
        deleteMessage(ctx, bot, id);
      }, 1000);
    }
  },
  // sixth stage
  async (ctx) => {
    try {
      if (ctx.message?.text) {
        ctx.reply(`Please choose from the above menu`);
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
        ctx.reply("No changes happened, Thanks for interacting with me.", {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      const state = ctx.wizard.state;

      await createReport(state.data, state.adminId, state.pairId);

      ctx.reply(
        `The Report config has been created\n\nDestination: ${state.data.reportDest}\nReport_Type: ${state.data.reportType}\nTime: ${state.data.time}\nperiod: ${state.data.period}\nAdmin_Id: ${state.adminId}\nPairId: ${ctx.wizard.state.pairId}`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
          },
        }
      );

      return ctx.wizard.next();
    } catch (err) {
      ctx.reply(`${err.message}`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
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
        ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// **************************************** Get Reports **********************************
const getReportScene = new Scenes.WizardScene(
  "getReportScene",
  async (ctx) => {
    try {
      let query;

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

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      const adminId = await getAdmin(ctx);

      const pairs = await getPairs(adminId);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "activity" }]);

      ctx.reply("Please Enter which pair you want to change", {
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
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
        },
      });
    }
  },
  // secound stage
  async (ctx) => {
    try {
      let query;

      // Only inlineKeyboard is working others must doesn't works
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
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      const reportConfigSnapshot = await getReportConfig(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );
      let msg = `The reports config for the chosen pair: ${ctx.wizard.state.pairId}`;

      reportConfigSnapshot.forEach((doc) => {
        msg += `\n\nConfig id: ${doc.id}\nEngine: ${doc.data().engine}\nPair: ${
          doc.data().pair
        }\nPeriod: ${doc.data().period}\nReport Dest: ${
          doc.data().reportDest
        }\nReport Type: ${doc.data().reportType}\nTime: ${doc.data().time}`;
      });

      ctx.reply(msg, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
        },
      });

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      const query = ctx.update.callback_query?.data;
      if (ctx.message?.text) {
        ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// **************************************** Delete Reports **********************************
const deleteReportScene = new Scenes.WizardScene(
  "deleteReportScene",
  async (ctx) => {
    try {
      let query;

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
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      const adminId = await getAdmin(ctx);

      const pairs = await getPairs(adminId);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "activity" }]);

      ctx.reply("Please Enter which pair you want to change", {
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
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
        },
      });
    }
  },
  // secound stage
  async (ctx) => {
    try {
      let query;

      // Only inlineKeyboard is working others must doesn't works
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
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      const reportConfigSnapshot = await getReportConfig(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      const reportConfigList = [[]];

      reportConfigSnapshot.forEach((doc) => {
        reportConfigList.push([{ text: doc.id, callback_data: doc.id }]);
      });

      reportConfigList.push([{ text: "Back", callback_data: "activity" }]);

      console.log(reportConfigList);
      ctx.reply("Please choose the report that you want to remove", {
        reply_markup: {
          inline_keyboard: reportConfigList,
        },
      });

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      let query;

      // Only inlineKeyboard is working others must doesn't works
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
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.reportId = query;

      const report = await getSpecificReport(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId,
        ctx.wizard.state.reportId
      );

      ctx.reply(
        `Please confirm you want to delete the report config:\n\nDestination: ${report.reportDest}\nReport_Type: ${report.reportType}\nTime: ${report.time}\nperiod: ${report.period}\nAdmin_Id: ${report.adminId}\nPairId: ${report.pairId}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Yes", callback_data: "Yes" }],
              [{ text: "No", callback_data: "activity" }],
            ],
          },
        }
      );

      ctx.wizard.next();
    } catch (err) {
      // reply with the error
      await activityReportList(ctx, bot);
      ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      // confirmation
      if (ctx.message?.text) {
        ctx.reply(`Please choose from the above menu`);
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
        ctx.reply("No changes happened, Thanks for interacting with me.", {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }

      await deleteReportConfig(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId,
        ctx.wizard.state.reportId
      );

      ctx.reply(
        `The report config ${ctx.wizard.state.reportId} has been deleted`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "activity" }]],
          },
        }
      );

      return ctx.wizard.next();
    } catch (error) {
      console.log(error);
    }
  },
  async (ctx) => {
    try {
      const query = ctx.update.callback_query?.data;
      if (ctx.message?.text) {
        ctx.reply(`Please choose from the above menu`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      if (query === "activity") {
        await activityReportList(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = { createReportScene, getReportScene, deleteReportScene };
