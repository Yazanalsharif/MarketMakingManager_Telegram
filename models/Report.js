const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");

// CREATE THE REPORT FOR A SPECIFIC PAIR
const createReport = async (data, adminId, pairId) => {
  try {
    const pairCollection = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(pairId);

    const reportsCollection = pairCollection.collection("reports");

    const pairQuery = await pairCollection.get();

    if (!pairQuery.data().pair || !pairQuery.data().engine) {
      throw new Error(
        "There are some data in the pairs must be added, The pair symbols and the Engine name, Please add those proberities to the pair collection "
      );
    }

    const reportQuery = await reportsCollection
      .where("reportDest", "==", data.reportDest)
      .where("time", "==", data.time)
      .where("period", "==", data.period)
      .where("pair", "==", pairQuery.data().pair)
      .where("engine", "==", pairQuery.data().engine)
      .get();

    if (!reportQuery.empty) {
      throw new ErrorResponse(
        "The report config has the same config, Please Enter another time",
        1
      );
    }

    await reportsCollection.add({
      pair: pairQuery.data().pair,
      engine: pairQuery.data().engine,
      reportDest: data.reportDest,
      period: data.period,
      reportType: data.reportType,
      time: data.time,
    });
  } finally {
  }
};

const getReportConfig = async (adminId, pairId) => {
  try {
    const pairCollection = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(pairId);

    const reportsCollection = pairCollection.collection("reports");

    const snapShotReports = await reportsCollection.get();

    if (snapShotReports.empty) {
      throw new Error(
        "There are no reports config belong to this pair and user."
      );
    }

    return snapShotReports;
  } finally {
  }
};

// Get the report config data and id that belong to the user id
const getReportConfigData = async (adminId, pairId) => {
  try {
    let reports = [];

    const reportsSnapshot = await db
      .collection("admins")
      .doc(adminId)
      .collection("Paris")
      .doc(pairId)
      .collection("reports")
      .get();

    if (reportsSnapshot.empty) {
      throw new ErrorResponse("There are no report data to display");
    }

    reportsSnapshot.forEach((doc) => {
      reports.push({ id: doc.id, data: doc.data() });
    });

    return reports;
  } catch (err) {
    console.log(err);
  }
};

//
const getSpecificReport = async (adminId, pairId, reportId) => {
  try {
    const pairCollection = db
      .collection("admins")
      .doc(adminId)
      .collection("Paris")
      .doc(pairId);

    const reportsCollection = pairCollection.collection("reports");

    const report = await reportsCollection.doc(reportId).get();

    return report.data();
  } catch (err) {
    console.log(err);
  }
};

const deleteReportConfig = async (adminId, pairId, reportId) => {
  try {
    const pairCollection = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(pairId);

    const reportsCollection = pairCollection.collection("reports");

    const reportDeleted = reportsCollection.doc(reportId).delete();

    return reportDeleted;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createReport,
  getReportConfig,
  deleteReportConfig,
  getSpecificReport,
  getReportConfigData,
};
