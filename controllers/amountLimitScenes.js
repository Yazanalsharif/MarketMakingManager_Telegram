const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");
const { getDocs } = require("../models/botConfig");
const { limitOrder } = require("./botConfig");

const Wizard = Scenes.WizardScene;

const amountOrderScene = new Scenes.WizardScene(
  "amountOrderScene",
  async (ctx) => {
    try {
      // get the limit amount colction
      const data = await getDocs("limit_order");
      // display the data and ask for the new data
      displayData(ctx, data);
      // ask for the new limit amount
      ctx.reply("Please Enter the new limit amount");
      // to store the data and pass it throgh middle ware
      ctx.wizard.state.data = {};
      ctx.wizard.state.data.precent = data[0].docsData.precent;

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
    }
  },
  async (ctx) => {
    try {
      let amount, query;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      // when the user use inline keyboard the text is empty and generate an error
      if (ctx.message.text) {
        // store the new data
        ctx.wizard.state.data.amount = ctx.message.text;
        amount = ctx.message.text;
      }

      if (isNaN(amount) || amount < 0) {
        // check if the number is valid
        ctx.reply(`Please Enter the valid amount`, {
          reply_markup: {
            inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
          },
        });

        return;
      }

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
    }
  },
  async (ctx) => {
    try {
      console.log(ctx.message?.text);
      if (ctx.message?.text) {
        throw new ErrorResponse("Please choose from the menu");
      }

      const query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      // Here is the function to store the values in the databases
      await limitOrder(ctx);

      // get the limit amount colction
      const data = await getDocs("limit_order");

      displayData(ctx, data);

      ctx.reply(
        `The new limit amount is ${ctx.wizard.state.data.amount} has been submitted`
      );

      ctx.scene.leave();

      // console.log(ctx.update.callback_query.id);
    } catch (err) {
      ctx.reply(err.message);
    }
  }
);

// Precent Scene for taking the precent value from the admin
const precentOrderScene = new Scenes.WizardScene(
  "precentOrderScene",
  async (ctx) => {
    try {
      // get the limit amount colction
      const data = await getDocs("limit_order");
      // display the data and ask for the new data
      await displayData(ctx, data);
      // ask for the new limit amount
      await ctx.reply("Please Enter the new precent");
      // to store the data and pass it throgh middle ware
      ctx.wizard.state.data = {};
      ctx.wizard.state.data.amount = data[0].docsData.amount;
      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
    }
  },
  async (ctx) => {
    try {
      let precent, query;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      // when the user use inline keyboard the text is empty and generate an error
      if (ctx.message.text) {
        // store the new data
        ctx.wizard.state.data.precent = ctx.message.text;
        precent = ctx.message.text;
      }

      if (isNaN(precent) || 100 >= precent <= 0) {
        // check if the number is valid
        ctx.reply(`Please Enter the valid number`, {
          reply_markup: {
            inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
          },
        });

        return;
      }

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
    }
  },
  async (ctx) => {
    try {
      console.log(ctx.message?.text);
      if (ctx.message?.text) {
        throw new ErrorResponse("Please choose from the menu");
      }

      const query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      await limitOrder(ctx);

      // get the limit amount colction
      const data = await getDocs("limit_order");

      // Here is the function to store the values in the databases
      console.log("The Data", data[0].docsData.amount);

      await displayData(ctx, data);

      await ctx.reply(
        `The new precent value is ${ctx.wizard.state.data.precent} has been submitted`
      );

      ctx.scene.leave();

      // console.log(ctx.update.callback_query.id);
    } catch (err) {
      ctx.reply(err.message);
    }
  }
);

// ************************ Helper functions *************************

// displays messages
const displayData = async (ctx, data) => {
  // display the data and ask for the new data
  await ctx.reply(`
  The Limit amount values,\namount: ${data[0].docsData.amount}\nmax: ${data[0].docsData.max}\nmin: ${data[0].docsData.min}\nprecent: ${data[0].docsData.precent}%\nNote the min and max values it depends on the amount and precent`);
};

module.exports = { amountOrderScene, precentOrderScene };
