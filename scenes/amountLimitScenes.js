const { Scenes } = require("telegraf");
const { limitOrderList } = require("../view/marketMaker");
const { getPairs, getPair, updatePair } = require("../models/Pairs");
const { getAdmin } = require("../models/User");
const bot = require("../bot");

const deleteMessage = require("../utils/deleteMessage");

const amountOrderScene = new Scenes.WizardScene(
  "amountOrderScene",
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

      if (query === "limit") {
        await leaveFunction(ctx, bot);
        return ctx.scene.leave();
      }
      const adminId = await getAdmin(ctx);

      // get the limit amount colction
      const pairs = await getPairs(adminId);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "limit" }]);

      ctx.reply("Please Enter which pair you want to change", {
        reply_markup: {
          inline_keyboard: pairsArray,
        },
      });

      ctx.wizard.state.data = {};
      ctx.wizard.state.adminId = adminId;

      ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
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

      if (query === "limit") {
        await leaveFunction(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.docId = query;
      const pair = await getPair(query, ctx.wizard.state.adminId);

      // store the paired properities in the state
      ctx.wizard.state.pair = pair;
      // store the precent in data state
      ctx.wizard.state.data.precent = pair.precent;
      // display the data and ask for the new data
      displayData(ctx, pair, `\n\nPlease Enter the new limit amount`);

      // to store the data and pass it throgh middle ware

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      let amount, query;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
      }

      // if the user didn't confirmed
      if (query === `No`) {
        return ctx.reply(
          "No changes happened, Thanks for interacting with me.",
          {
            reply_markup: {
              inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
            },
          }
        );
      }

      if (query === "limit") {
        await leaveFunction(ctx, bot);
        return ctx.scene.leave();
      }

      // when the user use inline keyboard the text is empty and generate an error
      if (ctx.message.text) {
        // store the new data to pass it to the next scene
        ctx.wizard.state.pair.limit = ctx.message.text;
        ctx.wizard.state.data.limit = ctx.message.text;
        amount = ctx.message.text;
      }

      if (isNaN(amount) || amount < 0) {
        ctx.reply(`Please Enter the valid amount`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      // delete the message when the data is valid
      await deleteMessage(ctx, bot, ctx.wizard.state.delete + 1);

      // ask for confirmation
      ctx.reply(`Please confirm the new limit amount is ${amount}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Yes", callback_data: "Yes" }],
            [{ text: "No", callback_data: "No" }],
          ],
        },
      });

      // pass to the next middle ware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
        },
      });
    }
  },
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
            inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
          },
        });

        return ctx.wizard.next();
      }

      console.log("data passed here", ctx.wizard.state.data);
      // Here is the function to store the values in the databases
      await updatePair(
        { limit: ctx.wizard.state.pair.limit },
        ctx.wizard.state.adminId,
        ctx.wizard.state.docId
      );
      const pair = ctx.wizard.state.pair;
      displayData(
        ctx,
        pair,
        `\n\nThe new limit amount is ${ctx.wizard.state.pair.limit} has been submitted`
      );

      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
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

      if (query === "limit") {
        await leaveFunction(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// Precent Scene for taking the precent value from the admin
const precentOrderScene = new Scenes.WizardScene(
  "precentOrderScene",
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

      if (query === "limit") {
        await leaveFunction(ctx, bot);
        return ctx.scene.leave();
      }
      const adminId = await getAdmin(ctx);

      // get the limit amount colction
      const pairs = await getPairs(adminId);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "limit" }]);

      ctx.reply("Please Enter which pair you want to change", {
        reply_markup: {
          inline_keyboard: pairsArray,
        },
      });

      ctx.wizard.state.data = {};
      ctx.wizard.state.adminId = adminId;

      ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
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

      if (query === "limit") {
        await leaveFunction(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.docId = query;
      const pair = await getPair(query, ctx.wizard.state.adminId);

      // store the paired properities in the state
      ctx.wizard.state.pair = pair;
      // store the precent in data state
      ctx.wizard.state.data.limit = pair.limit;

      // display the data and ask for the new data
      await displayData(ctx, pair, `\n\nPlease Enter the new precent`);

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      let precent, query;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
      }

      // if the user didn't confirmed
      if (query === `No`) {
        return ctx.reply(
          "No changes happened, Thanks for interacting with me.",
          {
            reply_markup: {
              inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
            },
          }
        );
      }

      if (query === "limit") {
        await leaveFunction(ctx, bot);
        return ctx.scene.leave();
      }

      // when the user use inline keyboard the text is empty and generate an error
      if (ctx.message.text) {
        ctx.wizard.state.pair.precent = ctx.message.text;
        ctx.wizard.state.data.precent = ctx.message.text;
        precent = ctx.message.text;
      }
      // 100 >= precet >= 0
      if (isNaN(precent) || precent >= 100 || precent <= 0) {
        ctx.reply(`Please Enter the valid amount`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      // store the new data
      await deleteMessage(ctx, bot, ctx.wizard.state.delete + 1);

      // ask for confirmation
      ctx.reply(`Please confirm the new precent value is ${precent}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Yes", callback_data: "Yes" }],
            [{ text: "No", callback_data: "No" }],
          ],
        },
      });

      // pass to the next middle ware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
        },
      });
    }
  },
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
            inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
          },
        });

        return ctx.wizard.next();
      }

      console.log("data passed here", ctx.wizard.state.data);
      // Here is the function to store the values in the databases
      await updatePair(
        { precent: ctx.wizard.state.pair.precent },
        ctx.wizard.state.adminId,
        ctx.wizard.state.docId
      );

      const pair = ctx.wizard.state.pair;

      await displayData(
        ctx,
        pair,
        `\n\nThe new precent value is ${ctx.wizard.state.data.precent} has been submitted`
      );
      return ctx.wizard.next();
      // console.log(ctx.update.callback_query.id);
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
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

      if (query === "limit") {
        await leaveFunction(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
        },
      });
    }
  }
);

// ************************ Helper functions *************************

// displays messages
const displayData = async (ctx, data, msg) => {
  // display the data and ask for the new data
  await ctx.reply(
    `
  The Pair data values,\nengine: ${data.engine}\nbase: ${data.base}\namount: ${data.limit}\nprecent: ${data.precent}${msg}`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "limit" }]],
      },
    }
  );

  ctx.wizard.state.delete =
    ctx.update.message?.message_id ||
    ctx.update.callback_query?.message.message_id;
};

const leaveFunction = async (ctx, bot) => {
  // leave to the limit menu
  await limitOrderList(ctx, bot);
};

module.exports = { amountOrderScene, precentOrderScene };
