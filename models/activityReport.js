const firebase = require("firebase-admin");
const serviceAccount = require("../config/test-app-config.json");
const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");
// firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
// });

// const db = firebase.firestore();

// db.settings({ ignoreUndefinedProperties: true });

// get the report throgh telegram user
const getReport = async (telegramUser) => {
  const reportsCollection = db.collection("Report");
  let reports = [];
  const reportSnapShot = await reportsCollection
    .where("destUser", "==", telegramUser)
    .get();
  console.log("report");

  if (reportSnapShot.empty) {
    console.log("The data doesn't Exist");
  }

  reportSnapShot.forEach((doc) => {
    reports.push(doc.data());
  });

  return reports;
};

const createReport = async (data) => {
  const reportsCollection = db.collection("Report");

  const query = await reportsCollection
    .where("user_address", "==", data.userAddress)
    .where("time", "==", data.time)
    .where("report_type", "==", data.reportType)
    .get();

  if (!query.empty) {
    throw new ErrorResponse(
      "The report config has the same config, Please Enter another time",
      1
    );
  }

  const res = await reportsCollection.add({
    admin_id: data.adminId,
    dest: data.dest,
    user_address: data.userAddress,
    report_type: data.reportType,
    time: data.time,
  });

  console.log(res);
};

// createReport({
//   adminId: "qusai123",
//   dest: "email",
//   telegramUser: "qusaiAlsharif",
//   reportType: "daily",
// });

module.exports = { createReport };
