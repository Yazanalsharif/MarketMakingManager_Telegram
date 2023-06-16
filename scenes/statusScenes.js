const { Scenes } = require("telegraf");

const {
  selectPairStep,
  displayInformationsStep,
} = require("./Stages/PairStages");

const {
  changeStatus,
  updateStatusConfirmationStep,
} = require("./Stages/StatusStages");

const updateStatusScene = new Scenes.WizardScene(
  "updateStatusScene",
  selectPairStep("statusList"),
  changeStatus(),
  updateStatusConfirmationStep()
);

// ********************************************** getStatusScene **********************
// //////////////////////////////////////////////////////////////////////////////////////////////////
const getStatusScene = new Scenes.WizardScene(
  "getStatusScene",
  selectPairStep("statusList"),
  displayInformationsStep("Status")
);

module.exports = { getStatusScene, updateStatusScene };
