const { Scenes } = require("telegraf");

// some steps will be taken from the pairStage
const {
  selectPairStep,
  displayInformationsStep,
} = require("./Stages/PairStages");

const {
  selectReport,
  deleteReportConfirmationStep,
  emailStep,
  typeStep,
  timeStep,
  telegramStep,
  confirmationReportStep,
  updateConfirmationStep,
  deleteEmailStep,
} = require("./Stages/ReportStages");

const createReportScene = new Scenes.WizardScene(
  "createReportScene",
  selectPairStep("reportList"),
  emailStep(),
  typeStep(),
  timeStep(),
  telegramStep(),
  confirmationReportStep()
);

// **************************************** Get Reports **********************************
const getReportScene = new Scenes.WizardScene(
  "getReportScene",
  selectPairStep("reportList"),
  selectReport(),
  displayInformationsStep("reportConfig")
);

// // **************************************** Delete Reports **********************************
const deleteReportScene = new Scenes.WizardScene(
  "deleteReportScene",
  selectPairStep("reportList"),
  selectReport(),
  deleteReportConfirmationStep()
);

const updateReportScene = new Scenes.WizardScene(
  "updateReportScene",
  selectPairStep("reportList"),
  selectReport(),
  emailStep(),
  deleteEmailStep(),
  typeStep(),
  timeStep(),
  telegramStep(),
  updateConfirmationStep()
);
module.exports = {
  createReportScene,
  getReportScene,
  deleteReportScene,
  updateReportScene,
};
