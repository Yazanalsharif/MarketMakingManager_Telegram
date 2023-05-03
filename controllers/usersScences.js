const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");

const Wizard = Scenes.WizardScene;

// @Description             sign the user to the telegram bot
// access                   Public
const signin = new Scenes.WizardScene(
  "signin",
  async (ctx) => {
    try {
      ctx.reply("This feature doesn't available currently");
      return ctx.scene.leave();
      // Ask for the email Address
      ctx.reply(`Please Enter your email address to sign in`, {
        reply_markup: {
          inline_keyboard: [[{ text: "Cancel", callback_data: "No" }]],
        },
      });
      // to store the data and pass it throgh middle ware
      ctx.wizard.state.data = {};

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      console.log("Error Here");
      console.log(err.message);
    }
  },
  async (ctx) => {
    try {
      let amount, query;

      // check if the ctx came from the inline keyboard
      query = ctx.update.callback_query?.data;

      // if the user didn't confirmed
      if (query === `No`) {
        ctx.reply("No changes happened, Thanks for interacting with me.");
        return ctx.scene.leave();
      }

      // check if the below data is an email address

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

module.exports = { signin };
