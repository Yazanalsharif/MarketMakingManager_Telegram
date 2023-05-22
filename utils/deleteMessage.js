const deleteMessage = async (ctx, bot, id) => {
  try {
    let messageId;

    if (id) {
      return await ctx.deleteMessage(id);
    }

    if (ctx.update.callback_query) {
      messageId = ctx.update.callback_query.message.message_id;
    } else {
      messageId = ctx.update.message.message_id;
    }

    console.log(messageId);
    // console.log("chat id", ctx.chat.id);

    await ctx.deleteMessage(messageId);
  } catch (err) {
    console.log(err);
  }
};

module.exports = deleteMessage;
