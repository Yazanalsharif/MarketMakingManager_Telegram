const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");

const bot = require("../bot");
const deleteMessage = require("../utils/deleteMessage");
const { getAdmin } = require("../models/User");
const { getPairs } = require("../models/Pairs");
const {
  getPriceStrategy,
  updatePriceStrategy,
} = require("../models/PriceStrategy");
const {
  changeStratigyList,
  priceStratigyList,
} = require("../view/marketMaker");

// ********************************************** updateStrategyThresholdScene **********************
// //////////////////////////////////////////////////////////////////////////////////////////////////

const updateStrategyThresholdScene = new Scenes.WizardScene(
  "updateStrategyThresholdScene",
  //   first stage
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

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      const adminId = await getAdmin(ctx);

      const pairs = await getPairs(adminId);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "priceStr" }]);

      ctx.reply("Please Enter which pair you want to change", {
        reply_markup: {
          inline_keyboard: pairsArray,
        },
      });

      //  to store the data and pass it throgh middle ware
      ctx.wizard.state.data = {};

      //   store the adminId to the session and pass it to the next middleware
      ctx.wizard.state.adminId = adminId;

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
      const priceStrategyData = await getPriceStrategy(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      // store the thershold to display it in the confirmation message
      ctx.wizard.state.data.threshold = priceStrategyData.threshold;
      // store the type of the price strategy
      ctx.wizard.state.data.type = priceStrategyData.type;

      const data = ctx.wizard.state.data;
      displayData(ctx, data, `\n\nPlease enter the new threshold`);

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
        `Please confirm the new data:\n\nPair Id: ${ctx.wizard.state.pairId}\nThe price strategy type: ${ctx.wizard.state.data.type}\nThreshold: ${ctx.wizard.state.data.threshold}`,
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
        `The price strategy has been changed\n\nPair Id: ${ctx.wizard.state.pairId}\nThe type: ${data.type}\nThe thershold: ${data.threshold}`,
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
  //   first stage
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

      if (query === "priceStr") {
        await changeStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      const adminId = await getAdmin(ctx);

      const pairs = await getPairs(adminId);

      let pairsArray = [[]];

      pairs.forEach((doc) => {
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
      });

      pairsArray.push([{ text: "Back", callback_data: "priceStr" }]);

      ctx.reply("Please Enter which pair you want to change", {
        reply_markup: {
          inline_keyboard: pairsArray,
        },
      });

      //  to store the data and pass it throgh middle ware
      ctx.wizard.state.data = {};

      //   store the adminId to the session and pass it to the next middleware
      ctx.wizard.state.adminId = adminId;

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
      const priceStrategyData = await getPriceStrategy(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      // store the thershold to display it in the confirmation message
      ctx.wizard.state.data.threshold = priceStrategyData.threshold;
      // store the type of the price strategy
      ctx.wizard.state.data.type = priceStrategyData.type;

      const data = ctx.wizard.state.data;

      ctx.reply(
        `The Pair Id: ${ctx.wizard.state.pairId}\nThe type: ${data.type}\nThe threshold: ${data.threshold}\n\nPlease enter the new price strategy type`,
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

      // the stored data in the session will be stored in the data const
      const data = ctx.wizard.state.data;

      // send a confirmation message to the user to confirm the changes
      ctx.reply(
        `Please confirm the new data:\n\nPair Id: ${ctx.wizard.state.pairId}\nThe price strategy type: ${data.type}\nThreshold: ${ctx.wizard.state.data.threshold}`,
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
        `The price strategy has been changed\n\nPair Id: ${ctx.wizard.state.pairId}\nThe type: ${data.type}\nThe thershold: ${data.threshold}`,
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
  async (ctx) => {
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
        pairsArray.push([{ text: doc.id, callback_data: doc.id }]);
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

      if (query === "priceStr") {
        await priceStratigyList(ctx, bot);
        return ctx.scene.leave();
      }

      ctx.wizard.state.pairId = query;

      const priceStrategy = await getPriceStrategy(
        ctx.wizard.state.adminId,
        ctx.wizard.state.pairId
      );

      let msg = `The price strategy for the pair ${ctx.wizard.state.pairId}`;

      msg += `\n\nThe Price strategy: ${priceStrategy.type}\nThe Threshold: ${priceStrategy.threshold}`;

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
  await ctx.reply(
    `
  The Pair Id: ${ctx.wizard.state.pairId}\nThe type: ${data.type}\nThe threshold: ${data.threshold}${msg}`,
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
