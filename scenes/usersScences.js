const { Scenes } = require("telegraf");
const ErrorResponse = require("../utils/ErrorResponse");
const { firebase } = require("../config/db");
const { signInUser } = require("../controllers/userController");

const { updateAdmin } = require("../models/User");
const deleteMessage = require("../utils/deleteMessage");
const { signInView, mainMenu } = require("../view/main");
const { emailStep, passwordStep } = require("./Stages/UserStages");

const auth = firebase.auth();

const Wizard = Scenes.WizardScene;

// @Description             sign the user to the telegram bot
// access                   Public
const signin = new Scenes.WizardScene(
  "signin",
  emailStep("signinList"),
  passwordStep()
);

module.exports = { signin };
