const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");
const { getDocs } = require("../models/botConfig");
const { getDoc, updateStatus } = require("../models/statusModule");

const Wizard = Scenes.WizardScene;

const updateStatusScene = new Scenes.WizardScene(
  "updateStatusScene",
  //   first stage
  async (ctx) => {
    try {
      const statusData = await getDocs("status");

      let statuses = [];
      statusData.forEach((doc) => {
        statuses.push({ text: doc.id, callback_data: doc.id });
      });

      ctx.wizard.state.statuses = statuses;

      ctx.reply(`Please choose the status you are trying to change `, {
        reply_markup: {
          inline_keyboard: [statuses],
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

      //   check if the status doc is exist

      const statusDoc = await getDoc(query);

      ctx.wizard.state.data.id = query;

      ctx.reply(`Please Enter The New Status`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Working", callback_data: "working" }],
            [{ text: "stop", callback_data: "stopped" }],
            [{ text: "Cancel", callback_data: "No" }],
          ],
        },
      });

      ctx.wizard.next();
    } catch (err) {
      ctx.reply(`${err.message}, Please choose from the above menu`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });
    }
  },
  //third stage
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

      ctx.wizard.state.data.status = query;
      ctx.wizard.state.data.reason = "Manually";

      const data = ctx.wizard.state.data;

      ctx.reply(
        `Please confirm the new data:\n\nId: ${data.id}\nStatus: ${data.status}\nReason: ${data.reason}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Yes", callback_data: "Yes" }],
              [{ text: "No", callback_data: "No" }],
            ],
          },
        }
      );

      ctx.wizard.next();
    } catch (err) {
      ctx.reply(err.message);
    }
  },
  // fourth stage
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
      //   update the data in the firestore
      await updateStatus(data);

      ctx.reply(
        `The Report config has been created\n\nId: ${data.id}\nStatus: ${data.status}\nTime: ${data.reason}`
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

// Get the status and display it in the telegram group
const getStatus = async (ctx) => {
  try {
    const statusData = await getDocs("status");
    let msg = `The status Data:\n\n`;
    statusData.forEach((doc) => {
      msg += `The status: ${doc.docsData.admin_id}\nThe status Id: ${doc.id}\nThe status: ${doc.docsData.status}\nThe Reason: ${doc.docsData.reason}\n\n`;
    });

    await ctx.reply(msg);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getStatus, updateStatusScene };
