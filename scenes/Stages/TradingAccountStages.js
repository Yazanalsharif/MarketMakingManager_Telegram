const { bot, notificationBot } = require("../../bot");
// schemas
const { MODELS } = require("../../models/models");

// views
const { mainMenu } = require("../../view/main");

//utils
const deleteMessage = require("../../utils/deleteMessage");
const {
  checkOptions,
  contentShouldEdit,
  resetStage,
  stringLenght,
  isNumeric,
} = require("./stageUtils");

//modules
const { getAdmin } = require("../../models/User");
const { getEngineData } = require("../../models/engines");
const {
  addNewAccount,
  getSpecificAccount,
  getAccounts,
  deleteAccountConfirmation,
} = require("../../models/TradingAccounts");

function apiNameStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to api name step");
      let query;
      let shouldEdit = true;
      let title = "";
      let name;

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let nameLenght = await stringLenght(ctx.message.text);
          if (
            nameLenght &&
            nameLenght >= MODELS.tradingAccount.user.minLenght &&
            nameLenght <= MODELS.tradingAccount.user.maxLength
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.data.user = ctx.message.text.trim();
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.tradingAccount.user.warning + "\n\n";
            console.log(ctx.wizard.state.message);
          }
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }
      ctx.wizard.state.firstEntry = false;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_apiName") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }
      if (query === "back_from_help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = false;
        ctx.wizard.state.message = undefined;
      }
      if (query === "help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = true;
        title = MODELS.tradingAccount.user.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.tradingAccount.user.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.tradingAccount.user.title
            : ctx.wizard.state.message + MODELS.tradingAccount.user.title;
      }
      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }
      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_apiName" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
        ]);
      }

      if (shouldEdit) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      ctx.wizard.state.message = undefined;
      return;
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  };

  return step;
}

function apiKeyStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to api key step");
      let query;
      let shouldEdit = true;
      let title = "";
      let name;

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let nameLenght = await stringLenght(ctx.message.text);
          if (
            nameLenght &&
            nameLenght >= MODELS.tradingAccount.key.minLenght &&
            nameLenght <= MODELS.tradingAccount.key.maxLength
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.data.key = ctx.message.text.trim();
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.tradingAccount.key.warning + "\n\n";
            console.log(ctx.wizard.state.message);
          }
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }
      ctx.wizard.state.firstEntry = false;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_apiKey") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }
      if (query === "back_from_help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = false;
        ctx.wizard.state.message = undefined;
      }
      if (query === "help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = true;
        title = MODELS.tradingAccount.key.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.tradingAccount.key.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.tradingAccount.key.title
            : ctx.wizard.state.message + MODELS.tradingAccount.key.title;
      }
      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }
      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_apiKey" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
        ]);
      }

      if (shouldEdit) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      ctx.wizard.state.message = undefined;
      return;
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  };

  return step;
}

function secretKeyStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to api secret step");
      let query;
      let shouldEdit = true;
      let title = "";
      let name;

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let nameLenght = await stringLenght(ctx.message.text);
          if (
            nameLenght &&
            nameLenght >= MODELS.tradingAccount.secret.minLenght &&
            nameLenght <= MODELS.tradingAccount.secret.maxLength
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.data.secret = ctx.message.text.trim();
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.tradingAccount.secret.warning + "\n\n";
            console.log(ctx.wizard.state.message);
          }
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }
      ctx.wizard.state.firstEntry = false;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_secretKey") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }
      if (query === "back_from_help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = false;
        ctx.wizard.state.message = undefined;
      }
      if (query === "help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = true;
        title = MODELS.tradingAccount.secret.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.tradingAccount.secret.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.tradingAccount.secret.title
            : ctx.wizard.state.message + MODELS.tradingAccount.secret.title;
      }
      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }
      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_secretKey" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
        ]);
      }

      if (shouldEdit) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      ctx.wizard.state.message = undefined;
      return;
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  };

  return step;
}

function passphraseStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to passphrase step");
      let query;
      let shouldEdit = true;
      let title = "";
      let name;

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let nameLenght = await stringLenght(ctx.message.text);
          if (
            nameLenght &&
            nameLenght >= MODELS.tradingAccount.passphrase.minLenght &&
            nameLenght <= MODELS.tradingAccount.passphrase.maxLength
          ) {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.data.passphrase = ctx.message.text.trim();
            ctx.wizard.next();
            resetStage(ctx);
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
          } else {
            let id = ctx.update.message.message_id;
            await deleteMessage(ctx, bot, id);
            ctx.wizard.state.message =
              MODELS.tradingAccount.passphrase.warning + "\n\n";
            console.log(ctx.wizard.state.message);
          }
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }
      ctx.wizard.state.firstEntry = false;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_backFromPass") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }
      if (query === "back_from_help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = false;
        ctx.wizard.state.message = undefined;
      }
      if (query === "help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = true;
        title = MODELS.tradingAccount.passphrase.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.tradingAccount.passphrase.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.tradingAccount.passphrase.title
            : ctx.wizard.state.message + MODELS.tradingAccount.passphrase.title;
      }
      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }
      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_backFromPass" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
        ]);
      }

      if (shouldEdit) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      ctx.wizard.state.message = undefined;
      return;
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  };

  return step;
}

function activeStep() {
  const stage = async (ctx) => {
    try {
      console.log("coming to active step");
      let query;
      let shouldEdit = true;
      let title = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let id = ctx.update.message.message_id;
          console.log("id", id);
          await deleteMessage(ctx, bot, id);
          ctx.wizard.state.message = MODELS.errors.textInsteadOfInline.text;
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }
      ctx.wizard.state.firstEntry = false;

      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        if (checkOptions(MODELS.tradingAccount.active.options, query)) {
          ctx.wizard.next();
          ctx.wizard.state.data.active = query;
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }
        console.log(query);
      }
      // check the query value if yes store the telegram user, if not don't

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_activeStep") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }

      if (query === "back_from_help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = false;
        ctx.wizard.state.message = undefined;
      }
      if (query === "help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = true;
        title = MODELS.tradingAccount.active.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }
      if (ctx.wizard.state.helpMode) {
        title = MODELS.tradingAccount.active.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.tradingAccount.active.title
            : ctx.wizard.state.message + MODELS.tradingAccount.active.title;
      }
      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }
      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        for (let option of MODELS.tradingAccount.active.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_activeStep" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
        ]);
      }

      if (shouldEdit) {
        console.log(ctx.chat.id);
        console.log(ctx.wizard.state.messageToEdit);
        console.log(ctx.wizard.state.messageToEdit);
        console.log(keyboard_options);
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      ctx.wizard.state.message = undefined;
      return;
    } catch (err) {
      // reply with the error
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

function addTradingAccountConfirmation() {
  let step = async (ctx) => {
    try {
      console.log(`Add Trading Account Confirmation Step`);
      let query;
      let shouldEdit = true;
      let title = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let id = ctx.update.message.message_id;
          console.log("id", id);
          await deleteMessage(ctx, bot, id);
          ctx.wizard.state.message = MODELS.errors.textInsteadOfInline.text;
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query && !ctx.wizard.state.firstEntry) {
        query = ctx.update.callback_query.data;
      }

      ctx.wizard.state.firstEntry = false;

      console.log(ctx.wizard.state.data);
      // replace engine with the platfrom

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "yes") {
        // create a credentials data
        let credential = {
          apiAuth: {
            key: ctx.wizard.state.data.key,
            passphrase: ctx.wizard.state.data.passphrase,
            secret: ctx.wizard.state.data.secret,
          },
          authVersion: 2,
          baseUrl: "https://api.kucoin.com",
        };

        // get the admin Id
        const adminId = await getAdmin(ctx);

        // get engine data
        const engine = await getEngineData(ctx.wizard.state.data.platform);

        let dataToSave = {};

        // add the values
        dataToSave["active"] = ctx.wizard.state.data.active;
        dataToSave["platform"] = ctx.wizard.state.data.platform;
        dataToSave["user"] = ctx.wizard.state.data.user;
        dataToSave["admin"] = adminId;
        dataToSave["engine"] = engine.id || undefined;
        dataToSave["sandbox"] = true;
        dataToSave["credential"] = credential;

        console.log(dataToSave);
        // add new account
        const account = await addNewAccount(dataToSave);

        // if the activity report has no been created becuase a duplication error
        if (!account) {
          ctx.wizard.state.message = `The entered data already exist, Please try to update them with new data\n\n`;
        } else {
          await mainMenu(ctx, bot);
          return ctx.scene.leave();
        }
      }
      if (query === "no") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "back_from_confirmation") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }
      let dataToPrint = "";

      // this condation because we took the engine from the engine step in the pair function
      // the name there is engine while the name here is platform
      if (ctx.wizard.state.data?.engine) {
        ctx.wizard.state.data.platform = ctx.wizard.state.data.engine;
        ctx.wizard.state.data.engine = undefined;
        delete ctx.wizard.state.data["engine"];
      }

      const dataKeys = Object.keys(ctx.wizard.state.data);

      for (let key of dataKeys) {
        dataToPrint =
          dataToPrint +
          MODELS.tradingAccount[key].name +
          " : " +
          ctx.wizard.state.data[key] +
          "\n";
      }

      title =
        ctx.wizard.state.message === undefined
          ? MODELS.tradingAccount.confirmation.title + "\n\n" + dataToPrint
          : ctx.wizard.state.message +
            MODELS.tradingAccount.confirmation.title +
            "\n\n" +
            dataToPrint;
      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }
      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        for (let option of MODELS.tradingAccount.confirmation.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_confirmation" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
        ]);
      }

      if (shouldEdit) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      ctx.wizard.state.message = undefined;
      return;
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  };
  return step;
}

function selectAccount() {
  const stage = async (ctx) => {
    try {
      console.log("Select Account Stage");
      let query;
      let shouldEdit = true;
      let title = "";

      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let id = ctx.update.message.message_id;
          console.log("id", id);
          await deleteMessage(ctx, bot, id);
          ctx.wizard.state.message = MODELS.errors.textInsteadOfInline.text;
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }

      ctx.wizard.state.firstEntry = false;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        ctx.wizard.state.messageToEdit =
          ctx.update.callback_query.message.message_id;

        query = ctx.update.callback_query.data;
        // check if the report doc exist in the database
        // if the report exist then the query is the report doc id
        const account = await getSpecificAccount(query);

        // check if the report exist
        if (account) {
          console.log("account to delete,", account);
          ctx.wizard.next();
          if (ctx.wizard.state.data === undefined) ctx.wizard.state.data = {};
          ctx.wizard.state.accountId = query;
          // ctx.wizard.state.data.pair = report.pair;
          ctx.wizard.state.data.user = account.user;
          ctx.wizard.state.data.platform = account.platform;
          ctx.wizard.state.data.active = account.active;

          ctx.wizard.state.account = account;
          resetStage(ctx);
          return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }

        console.log(`The Query: `, query);
      }

      // get admin Id
      const adminId = await getAdmin(ctx);
      ctx.wizard.state.adminId = adminId;

      // get the accounts belong to the admin
      const accounts = await getAccounts(ctx.wizard.state.adminId);

      if (!accounts || accounts.length === 0) {
        ctx.wizard.state.message = `There are no accounts belongs to the admin\n\n`;
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "back_from_selectAccount") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        // to be refactored
      }

      if (query === "back_from_help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = false;
        ctx.wizard.state.message = undefined;
      }

      if (query === "help") {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.helpMode = true;
        title = MODELS.tradingAccount.accountList.description;
        ctx.wizard.state.message = undefined;
        ctx.wizard.state.title = title;
      }

      if (ctx.wizard.state.helpMode) {
        title = MODELS.tradingAccount.accountList.description;
      } else {
        title =
          ctx.wizard.state.message === undefined
            ? MODELS.tradingAccount.accountList.title
            : ctx.wizard.state.message +
              MODELS.tradingAccount.accountList.title;
      }

      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }

      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        if (accounts) {
          for (let option of accounts) {
            keyboard_options[0].push({
              text:
                option.data.user +
                " | " +
                option.data.platform +
                " | " +
                option.data.active,
              callback_data: option.id,
            });
          }
        }

        keyboard_options.push([{ text: "Help", callback_data: "help" }]);
        keyboard_options.push([
          { text: "Back ", callback_data: "back_from_selectAccount" },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
        ]);
      }

      if (shouldEdit) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      //

      ctx.wizard.state.message = undefined;
    } catch (err) {
      // reply with the error
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

function deleteAccountConfirmationStep() {
  let step = async (ctx) => {
    try {
      console.log("coming to delete confirmation Step");
      let query;
      let shouldEdit = true;
      let title = "";
      if (ctx.message) {
        if (ctx.message.text && !ctx.wizard.state.firstEntry) {
          let id = ctx.update.message.message_id;
          console.log("id", id);
          await deleteMessage(ctx, bot, id);
          ctx.wizard.state.message = MODELS.errors.textInsteadOfInline.text;
        } else if (ctx.wizard.state.helpMode) {
          let id = ctx.update.message.message_id;
          await deleteMessage(ctx, bot, id);
        }
      }
      ctx.wizard.state.firstEntry = false;

      // check if the ctx came from the inline keyboard
      if (ctx.update.callback_query) {
        query = ctx.update.callback_query.data;
        console.log(query);
      }

      if (query === "main") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }
      if (query === "yes") {
        // Delete the account
        await deleteAccountConfirmation(ctx.wizard.state.accountId);

        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "no") {
        await mainMenu(ctx, bot);
        return ctx.scene.leave();
      }

      if (query === "back_from_deleteAccountConfirmation") {
        ctx.wizard.selectStep(ctx.wizard.cursor - 1);
        resetStage(ctx);
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
      }

      let dataToPrint = "";
      const dataKeys = Object.keys(ctx.wizard.state.data);
      console.log(dataKeys);
      for (let key of dataKeys) {
        if (key === "quote" || key === "base") {
          dataToPrint =
            dataToPrint +
            MODELS.pairs[key].name +
            " : " +
            ctx.wizard.state.data[key] +
            "\n";
        } else {
          dataToPrint =
            dataToPrint +
            MODELS.tradingAccount[key].name +
            " : " +
            ctx.wizard.state.data[key] +
            "\n";
        }
      }

      title =
        ctx.wizard.state.message === undefined
          ? MODELS.tradingAccount.deleteConfirmation.title + `\n` + dataToPrint
          : ctx.wizard.state.message +
            MODELS.tradingAccount.deleteConfirmation.title +
            dataToPrint;
      if (ctx.wizard.state.title !== title) {
        ctx.wizard.state.shouldEdit = true;
        ctx.wizard.state.title = title;
      }
      shouldEdit = contentShouldEdit(ctx);

      let keyboard_options = [[]];
      if (ctx.wizard.state.helpMode) {
        keyboard_options.push([
          { text: "back", callback_data: "back_from_help" },
        ]);
      } else {
        for (let option of MODELS.tradingAccount.deleteConfirmation.options) {
          keyboard_options[0].push({
            text: option.name,
            callback_data: option.id,
          });
        }
        keyboard_options.push([
          {
            text: "Back ",
            callback_data: "back_from_deleteAccountConfirmation",
          },
        ]);
        keyboard_options.push([
          { text: "Back To Home", callback_data: "main" },
        ]);
      }

      if (shouldEdit) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.wizard.state.messageToEdit,
          0,
          {
            text: title,
            inline_message_id: ctx.wizard.state.messageToEdit,
            reply_markup: {
              inline_keyboard: keyboard_options,
            },
          }
        );
      }

      ctx.wizard.state.message = undefined;
      return;
    } catch (err) {
      // reply with the error
      console.log(err);
      ctx.reply(err.message, {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
        },
      });
    }
  };
  return step;
}

module.exports = {
  apiNameStep,
  apiKeyStep,
  secretKeyStep,
  passphraseStep,
  addTradingAccountConfirmation,
  activeStep,
  selectAccount,
  deleteAccountConfirmationStep,
};
