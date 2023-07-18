const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");

// CREATE THE REPORT FOR A SPECIFIC PAIR
const addActivityReport = async (data, adminId, pairId) => {
  try {
    const pairCollection = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(pairId);

    const reportsCollection = pairCollection.collection("reports");

    const reportQuery = await reportsCollection
      .where("time", "==", data.time)
      .where("type", "==", data.type)
      .get();

    if (!reportQuery.empty) {
      return undefined;
    }

    const newReport = reportsCollection.doc();

    const result = await newReport.set(data);
    return result;
  } finally {
  }
};

// const getReportConfig = async (adminId, pairId) => {
//   try {
//     const pairCollection = db
//       .collection("admins")
//       .doc(adminId)
//       .collection("pairs")
//       .doc(pairId);

//     const reportsCollection = pairCollection.collection("reports");

//     const snapShotReports = await reportsCollection.get();

//     if (snapShotReports.empty) {
//       throw new Error(
//         "There are no reports config belong to this pair and user."
//       );
//     }

//     return snapShotReports;
//   } finally {
//   }
// };

// Get the report config data and id that belong to the user id

const getReports = async (adminId, pairId) => {
  try {
    let reports = [];

    const reportsSnapshot = await db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(pairId)
      .collection("reports")
      .get();

    if (reportsSnapshot.empty) {
      return undefined;
    }

    reportsSnapshot.forEach((doc) => {
      reports.push({ id: doc.id, data: doc.data() });
    });

    return reports;
  } catch (err) {
    console.log(err);
  }
};

const getSpecificReport = async (adminId, pairId, reportId) => {
  try {
    const pairCollection = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
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

const getEmailsInTheReport = async (adminId, pairId, reportId) => {
  try {
    let emails = [];
    const pairCollection = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(pairId);

    const reportsCollection = pairCollection.collection("reports");

    const report = await reportsCollection.doc(reportId).get();

    if (report.data()) {
      emails = report.data().emails;
    }

    return emails;
  } catch (err) {
    console.log(err);
  }
};

const updateReport = async (data, adminId, pairId, reportId) => {
  try {
    const pairSnapshot = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(pairId);

    const reportCollection = pairSnapshot.collection("reports").doc(reportId);

    const updateReport = await reportCollection.update(data);

    return true;
  } catch (err) {
    console.log(err);
  }
};

// getEmailsInTheReport(
//   "JzvrgJtx8idJXkw8R8C7RXvnhkE3",
//   "YDPkf5TATzff8B80K6Ep",
//   "360rWlVeFTmMoepCXkY0"
// );

module.exports = {
  addActivityReport,
  getReports,
  deleteReportConfig,
  getSpecificReport,
  getReports,
  getEmailsInTheReport,
  updateReport,
};
