const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");
const { getDocs } = require("../models/botConfig");
const { createReport } = require("../models/activityReport");

const Wizard = Scenes.WizardScene;

const createReportScene = new Scenes.WizardScene(
  "createReportScene",
  //   first stage
  async (ctx) => {
    try {
      ctx.reply(`Choose the way that you want receive a report throgh`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "telegram", callback_data: "telegram" }],
            [{ text: "email", callback_data: "email" }],
            [{ text: "Cancel", callback_data: "No" }],
          ],
        },
      });
      // to store the data and pass it throgh middle ware
      ctx.wizard.state.data = {};

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
    }
  },
  //   secound stage
  async (ctx) => {
    try {
      let amount, query;

      // Only inlineKeyboard is working others must doesn't works
      if (ctx.message?.text) {
        ctx.reply(`Please choose from the above menu`, {
          reply_markup: {
            inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
          },
        });

        return;
      }

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
      }

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      if (query === "email") {
        ctx.wizard.state.data.dest = "email";
        await ctx.reply("Please Enter The Email address", {
          reply_markup: {
            inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
          },
        });

        return ctx.wizard.next();
      }
      ctx.wizard.state.data.userAddress = ctx.chat.username;
      ctx.wizard.state.data.dest = query;

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
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      if (!ctx.message?.text) {
        throw new ErrorResponse("Please Enter The Email address");
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
      ctx.wizard.state.data.userAddress = ctx.message.text;

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
      await ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });
      console.log("error here");
    }
  },
  //fourth stage
  async (ctx) => {
    try {
      if (ctx.message?.text) {
        throw new ErrorResponse("Please choose from the menu");
      }

      const query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      ctx.wizard.state.data.reportType = query;

      ctx.reply(`Please Enter a specific time to receive the Report at it`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });

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
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      // when the user use inline keyboard the text is empty and generate an error
      if (time) {
        // store the new data
        ctx.wizard.state.data.time = ctx.message.text + ":00";
      }

      if (isNaN(time) || 23 >= time <= 0) {
        // check if the number is valid
        ctx.reply(`Please Enter the valid number`, {
          reply_markup: {
            inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
          },
        });

        return;
      }

      const admin = await getDocs("admin");

      ctx.wizard.state.data.adminId = admin[0].docsData.id;

      console.log(ctx.chat);

      const data = ctx.wizard.state.data;

      // ask for confirmation
      ctx.reply(
        `Please confirm the new data:\n\nDestination: ${data.dest}\nReport_Type: ${data.reportType}\nTime: ${data.time}\nTelegram_User: ${data.userAddress}\nAdmin_Id: ${data.adminId}`,
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
      ctx.reply(err.message);
    }
  },
  // sixth stage
  async (ctx) => {
    try {
      if (ctx.message?.text) {
        throw new ErrorResponse("Please choose from the menu");
      }

      const query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      const data = ctx.wizard.state.data;
      console.log(data);
      await createReport(data);

      ctx.reply(
        `The Report config has been created\n\nDestination: ${data.dest}\nReport_Type: ${data.reportType}\nTime: ${data.time}\nTelegram_User: ${data.userAddress}\nAdmin_Id: ${data.adminId}`
      );

      return ctx.scene.leave();
    } catch (err) {
      ctx.reply(`${err.message}`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });

      //   ctx.wizard.cursor(1);
      //   return ctx.scene.leave();
    }
  }
);

module.exports = { createReportScene };
