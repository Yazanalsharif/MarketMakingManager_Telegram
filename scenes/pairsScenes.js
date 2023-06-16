const { Scenes } = require("telegraf");

// Pairs steps or stages
const {
  selectPairStep,
  engineStep,
  baseStep,
  quoteStep,
  limitStep,
  thresholdStep,
  priceStrategyTypeStep,
  priceStrategyThresholdStep,
  buySellDiffStep,
  orderTimeoutStep,
  confirmationStep,
  updateConfirmationStep,
  displayInformationsStep,
} = require("./Stages/PairStages");

// Adding pair scene
addingPairScene = new Scenes.WizardScene(
  "addingPairScene",
  engineStep("pairsList"),
  baseStep(),
  quoteStep(),
  limitStep(),
  thresholdStep(),
  priceStrategyTypeStep(),
  priceStrategyThresholdStep(),
  orderTimeoutStep(),
  buySellDiffStep(),
  confirmationStep()
);

const getPriceStrategyScene = new Scenes.WizardScene(
  "getPriceStrategyScene",
  // first stage
  selectPairStep("priceStrategyList"),
  displayInformationsStep("priceStrategy")
);

const updateStrategyThresholdScene = new Scenes.WizardScene(
  "updateStrategyThresholdScene",
  //   first stage
  selectPairStep("priceStrategyChangeList"),
  priceStrategyThresholdStep(),
  updateConfirmationStep()
);

const updateStrategyTypeScene = new Scenes.WizardScene(
  "updateStrategyTypeScene",
  selectPairStep("priceStrategyChangeList"),
  priceStrategyTypeStep(),
  updateConfirmationStep()
);

const amountOrderScene = new Scenes.WizardScene(
  "amountOrderScene",
  selectPairStep("limitList"),
  limitStep(),
  updateConfirmationStep()
);

const precentOrderScene = new Scenes.WizardScene(
  "precentOrderScene",
  selectPairStep("limitList"),
  thresholdStep(),
  updateConfirmationStep()
);

// order cancelation
const orderCancelationScene = new Scenes.WizardScene(
  "orderCancelationScene",
  selectPairStep("pairsList"),
  orderTimeoutStep(),
  updateConfirmationStep()
);

// order gab scene
const orderGapScene = new Scenes.WizardScene(
  "orderGapScene",
  selectPairStep("pairsList"),
  buySellDiffStep(),
  updateConfirmationStep()
);

module.exports = {
  addingPairScene,
  getPriceStrategyScene,
  updateStrategyTypeScene,
  updateStrategyThresholdScene,
  amountOrderScene,
  precentOrderScene,
  orderCancelationScene,
  orderGapScene,
};
