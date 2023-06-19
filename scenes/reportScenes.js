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

// const verifyTime = async (time) => {
//   try {
//     const timeArray = time.split(":");

//     // check if the timeArray is right
//     if (!timeArray && timeArray.length === 0) {
//       return undefined;
//     }

//     let hours = parseInt(timeArray[0]);
//     let minutes = parseInt(timeArray[1]);

//     // the hours will be in first item and the minutes will be the second item
//     if (isNaN(hours) || isNaN(minutes)) {
//       return undefined;
//     }

//     if (timeArray[1].length === 1) {
//       timeArray[1] *= 10;
//     }

//     if (timeArray[1].length > 2) {
//       return undefined;
//     }

//     // if (timeArray[1].trim().length > 1 && minutes <= 5) {
//     //   minutes = timeArray[1] * 10;
//     // } else {
//     //   minutes = timeArray[1];
//     //   console.log(minutes);
//     // }

//     // check if the numbers is time or not
//     if (
//       0 <= timeArray[0] &&
//       timeArray[0] <= 23 &&
//       0 <= timeArray[1] &&
//       timeArray[1] <= 59
//     ) {
//       let verifiedTime = timeArray[0] + ":" + timeArray[1];

//       console.log(verifiedTime);
//       console.log(timeArray[1]);

//       return verifiedTime;
//     }

//     return undefined;
//     // console.log(timeArray);
//   } catch (err) {
//     console.log(err);
//   }
// };

module.exports = { createReportScene, getReportScene, deleteReportScene };
