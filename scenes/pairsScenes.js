const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");

const bot = require("../bot");
const deleteMessage = require("../utils/deleteMessage");
const { getAdmin } = require("../models/User");
const { getPairs, getPair, updatePair } = require("../models/Pairs");
const { mainMenu } = require("../view/main");

// ********************************************** update the cancelation time out **********************
// //////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////
function choosePairStage() {
  const stage = async (ctx) => {
    try {
      let query;

      console.log("choosing the pair");
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
      console.log(pairs);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.data.pair, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "main" }]);
      console.log(pairsArray);
      await ctx.reply("Please Enter which pair you want to change", {
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
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  };

  return stage;
}

const orderCancelationScene = new Scenes.WizardScene(
  "orderCancelationScene",
  choosePairStage(),
  //   secound stage
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

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      // get a specific pair data
      const pairData = await getPair(
        ctx.wizard.state.pairId,
        ctx.wizard.state.adminId
      );

      ctx.wizard.state.pairData = pairData;
      displayData(ctx, pairData, `\n\nPlease enter the new orders timeout`);

      ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      let cancelationTimeout, query;

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
              inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
            },
          }
        );
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      // when the user use inline keyboard the text is empty and generate an error
      if (ctx.message.text) {
        ctx.wizard.state.data.cancelationTimeout = ctx.message.text;
        cancelationTimeout = ctx.message.text;
      }
      // 100 >= precet >= 0
      if (
        isNaN(cancelationTimeout) ||
        cancelationTimeout > 3600 ||
        cancelationTimeout < 2
      ) {
        ctx.reply(`Please Enter the valid amount`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      //  delete the message
      await deleteMessage(ctx, bot, ctx.wizard.state.delete);

      //   add the new cancelation time to the pairdata to display it
      ctx.wizard.state.pairData.orderTimeout = cancelationTimeout;
      // send a confirmation message to the user to confirm the changes
      await confirmationQuestion(
        ctx,
        ctx.wizard.state.pairData,
        `\n\nPlease confirm the new data`
      );

      // pass to the next middle ware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  },
  // fourth stage
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
            inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      const data = ctx.wizard.state.data;

      //   update the data in the firestore
      await updatePair(
        { orderTimeout: data.cancelationTimeout },
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      await displayData(
        ctx,
        ctx.wizard.state.pairData,
        `\n\nThe cancelation order time has been updated`
      );

      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
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

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  }
);

// ********************************************** order Gap Scene **********************
// //////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////

const orderGapScene = new Scenes.WizardScene(
  "orderGapScene",
  choosePairStage(),
  //   secound stage
  async (ctx) => {
    try {
      let amount, query;

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

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      // get a specific pair data
      const pairData = await getPair(
        ctx.wizard.state.pairId,
        ctx.wizard.state.adminId
      );

      ctx.wizard.state.pairData = pairData;
      displayData(
        ctx,
        pairData,
        `\n\nPlease enter the new Buy and Sell Amount difference`
      );

      ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      let gap, query;

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
              inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
            },
          }
        );
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      // when the user use inline keyboard the text is empty and generate an error
      if (ctx.message.text) {
        ctx.wizard.state.data.gap = ctx.message.text;
        gap = ctx.message.text;
      }
      // 100 >= Gap >= -100
      if (isNaN(gap) || gap > 100 || gap < -100) {
        ctx.reply(`Please Enter the valid amount`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      //  delete the message
      await deleteMessage(ctx, bot, ctx.wizard.state.delete);

      //   add the new cancelation time to the pairdata to display it
      ctx.wizard.state.pairData.buySellDiff = gap;
      // send a confirmation message to the user to confirm the changes
      await confirmationQuestion(
        ctx,
        ctx.wizard.state.pairData,
        `\n\nPlease confirm the new Gap value`
      );

      // pass to the next middle ware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
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
        ctx.reply("No changes happened, Thanks for interacting with me.", {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      const data = ctx.wizard.state.data;

      //   update the data in the firestore
      await updatePair(
        { buySellDiff: data.gap },
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      await displayData(
        ctx,
        ctx.wizard.state.pairData,
        `\n\nThe Gap value has been updated`
      );

      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
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

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  }
);

// ************************ Helper functions *************************

// displays messages
const displayData = async (ctx, data, msg) => {
  // display the data and ask for the new data
  console.log(`The data`, data);
  await ctx.reply(
    `
      The pair data (${data.pair}),\n\nEngine: ${data.engine}\nBase: ${data.base}\nQuote: ${data.quote}\nprecent: ${data.precent}\nBuy and Sell Amount difference: ${data.buySellDiff}\nOrders Timeout: ${data.orderTimeout} (seconds)${msg}`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
      },
    }
  );

  ctx.wizard.state.delete =
    ctx.update.message?.message_id ||
    ctx.update.callback_query?.message.message_id + 1;
};

const leaveFunction = async (ctx, bot) => {
  // leave to the limit menu
  await limitOrderList(ctx, bot);
};

const confirmationQuestion = async (ctx, data, msg) => {
  try {
    // display the data and ask for the new data
    await ctx.reply(
      `
      The pair data (${data.pair}),\n\nEngine: ${data.engine}\nBase: ${data.base}\nQuote: ${data.quote}\nprecent: ${data.precent}\nBuy and Sell Amount difference: ${data.buySellDiff}\nOrders Timeout: ${data.orderTimeout} (seconds)${msg}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Yes", callback_data: "Yes" }],
            [{ text: "No", callback_data: "main" }],
          ],
        },
      }
    );
  } finally {
  }
};
module.exports = { orderCancelationScene, orderGapScene };
