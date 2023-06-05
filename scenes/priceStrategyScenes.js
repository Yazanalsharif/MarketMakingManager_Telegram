const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");

const bot = require("../bot");
const deleteMessage = require("../utils/deleteMessage");
const { getAdmin } = require("../models/User");
const { getPairs, getPair } = require("../models/Pairs");
const {
  getPriceStrategy,
  updatePriceStrategy,
} = require("../models/PriceStrategy");
const {
  changeStratigyList,
  priceStratigyList,
} = require("../view/marketMaker");

// choose pair stage is a stage for diplaying the pairs name to let user choose
function choosePairStage() {
  const stage = async (ctx) => {
    console.log("the price strategy pairs");
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

      if (query === "priceStr") {
        await priceStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      const adminId = await getAdmin(ctx);

      const pairs = await getPairs(adminId);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.data.pair, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "priceStr" }]);

      ctx.reply("Select the pair to get the strategy price", {
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
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
        },
      });
    }
  };

  return stage;
}

// ********************************************** updateStrategyThresholdScene **********************
// //////////////////////////////////////////////////////////////////////////////////////////////////

const updateStrategyThresholdScene = new Scenes.WizardScene(
  "updateStrategyThresholdScene",
  //   first stage
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

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      // get the threshold from the collection
      const pair = await getPair(
        ctx.wizard.state.pairId,
        ctx.wizard.state.adminId
      );

      if (!pair) {
        throw new Error(`The pair doesn't exist, Please try again later...`);
      }

      ctx.wizard.state.pair = pair;
      // store the thershold to display it in the confirmation message
      ctx.wizard.state.data.threshold = pair.priceStrategy.threshold;
      // store the type of the price strategy
      ctx.wizard.state.data.type = pair.priceStrategy.type;

      displayData(ctx, pair, `\n\nPlease enter the new threshold`);

      ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
        },
      });
    }
  },
  async (ctx) => {
    try {
      let threshold, query;

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
              inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
            },
          }
        );
      }

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      // when the user use inline keyboard the text is empty and generate an error
      if (ctx.message.text) {
        ctx.wizard.state.data.threshold = ctx.message.text;
        threshold = ctx.message.text;
      }
      // 100 >= precet >= 0
      if (isNaN(threshold) || threshold >= 100 || threshold <= 0) {
        ctx.reply(`Please Enter the valid amount`);
        await setTimeout(() => {
          let id = ctx.update.message.message_id + 1;
          deleteMessage(ctx, bot, id);
        }, 1000);

        // store the new data
        return;
      }

      //  delete the message
      await deleteMessage(ctx, bot, ctx.wizard.state.delete + 1);

      // send a confirmation message to the user to confirm the changes
      ctx.reply(
        `The Pair: ${ctx.wizard.state.pair.pair}\n\nThe engine: ${ctx.wizard.state.pair.engineName}\nThe symbol: ${ctx.wizard.state.pair.symbol}\nThe type: ${ctx.wizard.state.pair.priceStrategy.type}\nThe threshold: ${ctx.wizard.state.data.threshold}\n\nPlease confirm the new data`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Yes", callback_data: "Yes" }],
              [{ text: "No", callback_data: "priceStr" }],
            ],
          },
        }
      );

      // pass to the next middle ware
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
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
            inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      const data = ctx.wizard.state.data;

      //   update the data in the firestore
      await updatePriceStrategy(
        { type: data.type, threshold: data.threshold },
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId,
        ctx.wizard.state.priceStrategyId
      );

      ctx.reply(
        `The Pair: ${ctx.wizard.state.pair.pair}\n\nThe engine: ${ctx.wizard.state.pair.engineName}\nThe symbol: ${ctx.wizard.state.pair.symbol}\nThe type: ${ctx.wizard.state.pair.priceStrategy.type}\nThe threshold: ${ctx.wizard.state.data.threshold}\n\nThe price strategy has been updated.`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
          },
        }
      );

      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
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

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
        },
      });
    }
  }
);

// ********************************************** updateStrategyTypeScene **********************
// //////////////////////////////////////////////////////////////////////////////////////////////////

const updateStrategyTypeScene = new Scenes.WizardScene(
  "updateStrategyTypeScene",
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

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      // get the threshold from the collection
      const pair = await getPair(
        ctx.wizard.state.pairId,
        ctx.wizard.state.adminId
      );

      if (!pair) {
        throw new Error(`The pair doesn't exist, Please try again later...`);
      }

      ctx.wizard.state.pair = pair;

      // store the thershold to display it in the confirmation message
      ctx.wizard.state.data.threshold = pair.priceStrategy.threshold;
      // store the type of the price strategy
      ctx.wizard.state.data.type = pair.priceStrategy.type;

      ctx.reply(
        `The Pair: ${pair.pair}\n\nThe engine: ${pair.engineName}\nThe symbol: ${pair.symbol}\nThe type: ${pair.priceStrategy.type}\nThe threshold: ${pair.priceStrategy.threshold}\n\nPlease enter the new price strategy type`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Random", callback_data: "RANDOM" }],
              [{ text: "Up", callback_data: "UP" }],
              [{ text: "Down", callback_data: "DOWN" }],
              [{ text: "Cancel", callback_data: "priceStr" }],
            ],
          },
        }
      );

      ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
        },
      });
    }
  },
  //third stage
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
            inline_keyboard: [
              statuses,
              [{ text: "Back", callback_data: "priceStr" }],
            ],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      // The query will include the three values (Random, Up, Down)
      ctx.wizard.state.data.type = query;

      // send a confirmation message to the user to confirm the changes
      ctx.reply(
        `The Pair: ${ctx.wizard.state.pair.pair}\n\nThe engine: ${ctx.wizard.state.pair.engineName}\nThe symbol: ${ctx.wizard.state.pair.symbol}\nThe type: ${ctx.wizard.state.data.type}\nThe threshold: ${ctx.wizard.state.data.threshold}\n\nPlease confirm the new data`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Yes", callback_data: "Yes" }],
              [{ text: "No", callback_data: "priceStr" }],
            ],
          },
        }
      );

      ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
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
            inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
          },
        });
        return ctx.wizard.next();
      }

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      const data = ctx.wizard.state.data;

      //   update the data in the firestore
      await updatePriceStrategy(
        { type: data.type, threshold: data.threshold },
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId,
        ctx.wizard.state.priceStrategyId
      );

      ctx.reply(
        `The Pair: ${ctx.wizard.state.pair.pair}\n\nThe engine: ${ctx.wizard.state.pair.engineName}\nThe symbol: ${ctx.wizard.state.pair.symbol}\nThe type: ${ctx.wizard.state.data.type}\nThe threshold: ${ctx.wizard.state.data.threshold}\n\nThe price strategy has been changed`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
          },
        }
      );

      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
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

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
        },
      });
    }
  }
);

// ********************************************** getPriceStrategyScene **********************
// //////////////////////////////////////////////////////////////////////////////////////////////////
//get price strategy scene
const getPriceStrategyScene = new Scenes.WizardScene(
  "getPriceStrategyScene",
  // first stage
  choosePairStage(),
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

      if (query === "priceStr") {
        await priceStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      console.log(ctx.wizard.state.pairId);
      const pair = await getPair(
        ctx.wizard.state.pairId,
        ctx.wizard.state.adminId
      );

      if (!pair) {
        throw new Error(`The pair doesn't exist, Please try again later...`);
      }

      let msg = `The price strategy for the pair ${pair.pair}`;

      msg += `\n\nThe engine: ${pair.engineName}\nThe symbol: ${pair.symbol}\nThe price strategy: ${pair.priceStrategy.type}\nThe threshold: ${pair.priceStrategy.threshold}`;

      ctx.reply(msg, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
        },
      });

      // next middleware
      return ctx.wizard.next();
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
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

      if (query === "priceStr") {
        await priceStratigyList(ctx, bot);
        return ctx.scene.leave();
      }
    } catch (error) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
        },
      });
    }
  }
);

// displays messages
const displayData = async (ctx, data, msg) => {
  // display the data and ask for the new data
  console.log(data);
  await ctx.reply(
    `
    Pair: ${data.pair}\n\nThe engine: ${data.engineName}\nThe symbol: ${data.symbol}\nThe price strategy: ${data.priceStrategy.type}\nThe threshold: ${data.priceStrategy.threshold}${msg}`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "priceStr" }]],
      },
    }
  );

  ctx.wizard.state.delete =
    ctx.update.message?.message_id ||
    ctx.update.callback_query?.message.message_id;
};

module.exports = {
  getPriceStrategyScene,
  updateStrategyTypeScene,
  updateStrategyThresholdScene,
};
