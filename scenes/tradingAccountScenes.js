const { Scenes } = require("telegraf");

// steps
const { engineStep } = require("./Stages/PairStages");

const {
  apiNameStep,
  apiKeyStep,
  secretKeyStep,
  passphraseStep,
  activeStep,
  addTradingAccountConfirmation,
  selectAccount,
  deleteAccountConfirmationStep,
} = require("./Stages/TradingAccountStages");

const addTradingAccount = new Scenes.WizardScene(
  "addTradingAccount",
  engineStep("tradingAccountList"),
  apiNameStep(),
  apiKeyStep(),
  secretKeyStep(),
  passphraseStep(),
  activeStep(),
  addTradingAccountConfirmation()
);

const deleteTradingAccount = new Scenes.WizardScene(
  "deleteTradingAccount",
  selectAccount(),
  deleteAccountConfirmationStep()
);

// exports the scenes
module.exports = {
  addTradingAccount,
  deleteTradingAccount,
};
