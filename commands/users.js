const { bot, notificationBot } = require("../bot");
const { signInView } = require("../view/main");
const { isNotAuthorized } = require("../middlewares/authorized");
const deleteMessage = require("../utils/deleteMessage");
const { signOut } = require("../models/User");

const {
  addUser,
  deleteUser,
  getUsers,
  updateUserName,
} = require("../controllers/userController");
const { menuConfig } = require("../controllers/marketMakerController");

// // addUser command for adding the telegram userName
// bot.command("addUser", async (ctx) => {
//   // the add user function to add the new Manager to the bot database
//   await addUser(ctx, bot);
// });

// // Delete the users from the database
// bot.command("deleteUser", async (ctx) => {
//   await deleteUser(ctx);
// });

// // Get the users with their
// bot.command("getUsers", async (ctx) => {
//   await getUsers(ctx);
// });
// // update the userName of the telegram account
// bot.command("updateUser", async (ctx) => {
//   await updateUserName(ctx);
// });

//******************************* Actions commands

bot.action("sign-in", async (ctx) => {
  try {
    // await signOut(ctx);
    await ctx.scene.enter("signin");
  } catch (err) {
    console.log(err.message);
  }
});

// help Function
bot.action("signInHelp", async (ctx) => {
  try {
    ctx.reply("Help signin List here", {
      reply_markup: {
        inline_keyboard: [[{ text: "Back", callback_data: "main" }]],
      },
    });
  } catch (err) {
    console.log(err);
  }
});
