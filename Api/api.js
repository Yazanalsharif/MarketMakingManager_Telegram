const { User, getUserByUserName } = require("../models/User");
const express = require("express");
const ErrorResponse = require("../utils/ErrorResponse");
const { Telegraf } = require("telegraf");
const asyncHandler = require("../middlewares/asyncHandler");
const multer = require("multer");

const router = express.Router();

const bot = new Telegraf(process.env.BOT_KEY);

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(docx|pdf|xlsx|txt)$/)) {
      return cb(new Error("you Must Upload docx, pdf, xlsx or txt"));
    }
    cb(undefined, true);
  },
});

// @Description              End Point for letting the bot send Message and attachements for a specific telegram user
// @Method                   Post /v1/sendMessage/:userName
// @access                   Public
router.post(
  "/sendMessage/:userName",
  upload.single("report"),
  asyncHandler(async (req, res, next) => {
    const message = req.query.text;
    const type = req.query.type;
    let user;

    const userSnapshot = await getUserByUserName(req.params.userName);

    console.log(`HERE IS THE ERROR`);
    userSnapshot.forEach((doc) => {
      return (user = doc.data());
    });

    if (!user.chat_id) {
      return next(
        new ErrorResponse(
          "The user doesn't has a chat_id, Please let the user sign in to the telegram bot.",
          400
        )
      );
    }

    console.log(user.chat_id);

    if (!req.file) {
      return next(
        new ErrorResponse("Please Enter the file throgh form-data", 400)
      );
    }

    if (message) {
      await bot.telegram.sendMessage(
        user.chat_id,
        `Report Message\n\n${message}`
      );
    }

    await bot.telegram.sendDocument(user.chat_id, {
      source: req.file.buffer,
      filename: req.file.originalname,
    });

    res.status(200).json({
      success: true,
      user: {
        email: user.email,
        chat_id: user.chat_id,
        telegram_user: user.telegram_user,
      },
      message,
    });
  })
);

// @Description              End Point for letting the bot send Message and attachements for via Email
// @Method                   Post /v1/sendEmail
// @access                   Public
// router.post(
//   "/sendEmail",
//   upload.single("report"),
//   asyncHandler(async (req, res, next) => {
//     const message = req.query.text;
//     const type = req.query.type;
//     const emails = [];

//     const snapshotEmails = await db
//       .collection("Report")
//       .where("dest", "==", "email")
//       .get();

//     if (snapshotEmails.empty) {
//       return next(
//         new ErrorResponse(
//           "There is no emails to send in, Please config the email feature throgh telegram bot"
//         )
//       );
//     }
//     // get the emails addresses
//     snapshotEmails.forEach((doc) => {
//       emails.push(doc.data().user_address);
//     });

//     console.log(req.file);

//     // if (!req.file) {
//     //   return next(new ErrorResponse("Please Enter the file throgh form-data"));
//     // }

//     // emails.forEach(async (email) => {
//     //   await sendMail({ email, name: type, message });
//     // });

//     // res.status(200).json({
//     //   success: true,
//     //   users: user,
//     //   message,
//     // });
//   })
// );

// @Description              End Point for letting the bot sending to the users
// @Method                   Post /v1/sendMessage
// @access                   Public
router.post(
  "/sendMessage",
  asyncHandler(async (req, res, next) => {
    const message = req.body.message;

    let sentUsers = [];
    // Get the users
    const users = await User.find({});
    // send a messages for the users
    users.forEach((user) => {
      if (user.chat_id) {
        bot.telegram.sendMessage(user.chat_id, message);
        sentUsers.push(user.userName);
      }
    });

    res.json({
      success: true,
      users: sentUsers,
      message,
    });
  })
);

// @Description              Get the active users from the telegram.
// @Method                   GET /v1/users
// @access                   Public
router.get(
  "/users",
  asyncHandler(async (req, res, next) => {
    const users = await User.find({});
    const actives = [];
    users.forEach((user) => {
      if (user.chat_id) {
        actives.push(user.userName);
      }
    });
    res.status(200).json({
      success: true,
      users: actives,
    });
  })
);

module.exports = router;
