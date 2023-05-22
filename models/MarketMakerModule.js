const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");

const getPairs = async (adminId) => {};

// This function will handle the both collections => amount_limit, transaction_rate_limit
const limitConfig = async (data) => {
  // Get the data from a specific collection
  const getDoc = await db.collection(data.collection).doc(data.doc).get();

  if (!getDoc.exists) {
    throw new ErrorResponse(
      `The Doc ${data.doc} Not exist in the configuration Please try again with a valid data`
    );
  }

  // validate the values than entered by the command
  if (isNaN(data.limit) || parseFloat(data.limit) < 0) {
    throw new ErrorResponse(
      "Please Enter the secound parameter as a Number and it must be a positive numbers only"
    );
  }

  // check the enable data if its boolean and convert it to the Boolean Data Type
  if (data.enable === "false") {
    data.enable = false;
  } else {
    data.enable = true;
  }

  // update the values in the collection and docs
  const res = await db
    .collection(data.collection)
    .doc(data.doc)
    .update({
      limit: parseFloat(data.limit),
      enable: data.enable,
    });

  return res;
};

const userBotConfigModule = async (data) => {
  // Get the data from a specific collection
  const getDoc = await db.collection(data.collection).doc(data.doc).get();

  // check if the doc exist
  if (!getDoc.exists) {
    throw new ErrorResponse(
      `The Doc ${data.doc} Not exist in the configuration Please try again with a valid data`
    );
  }

  // check the enable data if its boolean and convert it to the Boolean Data Type
  if (data.enable === "false") {
    data.enable = false;
  } else {
    data.enable = true;
  }

  // update the values in the collection and docs
  const res = await db.collection(data.collection).doc(data.doc).update({
    enable: data.enable,
  });

  return res;
};

// this function will return the docs in a specific collection
const getDocs = async (colcName) => {
  const balanceDocs = db.collection(colcName);

  const snapShot = await balanceDocs.get();

  // this data will include the whole docs arrays
  let data = [];

  // console.log(snapShot);
  snapShot.forEach((doc) => {
    const docId = doc.id;
    data.push({ id: docId, docsData: doc.data() });
  });

  return data;
};

const updateEngine = async (data) => {
  // Get the data from a specific collection
  const getDoc = await db.collection(data.collection).doc(data.doc).get();

  if (!getDoc.exists) {
    throw new ErrorResponse(
      `The Doc ${data.doc} Not exist in the configuration Please try again with a valid data`
    );
  }

  // check the enable data if its boolean and convert it to the Boolean Data Type
  if (!data.enable) {
    data.enable = false;
  } else {
    data.enable = true;
  }

  // update the values in the collection and docs
  const res = await db.collection(data.collection).doc(data.doc).update({
    enable: data.enable,
    name: data.name,
    prefix: data.prefix,
  });

  return res;
};

const updateLimitOrder = async (data) => {
  // Get the data from a specific collection
  const getDoc = await db.collection(data.collection).doc(data.doc).get();
  // check the data here
  if (!getDoc.exists) {
    throw new ErrorResponse(
      `The Doc ${data.doc} Not exist in the configuration Please try again with a valid data`
    );
  }

  const res = await db.collection(data.collection).doc(data.doc).update({
    amount: data.amount,
    max: data.max,
    min: data.min,
    precent: data.precent,
  });

  return res;
};

// ************************************************ Report Functions **************************************

// const createReport = async (data, adminId, pairId) => {
//   const reportsCollection = db
//     .collection("Admin")
//     .doc(adminId)
//     .collection("Paris")
//     .doc(pairId)
//     .collection("report_config");

//   const query = await reportsCollection
//     .where("reportDest", "==", data.reportDest)
//     .where("time", "==", data.time)
//     .where("period", "==", data.period)
//     .get();

//   if (!query.empty) {
//     throw new ErrorResponse(
//       "The report config has the same config, Please Enter another time",
//       1
//     );
//   }

//   const res = await reportsCollection.add({
//     reportDest: data.reportDest,
//     period: data.period,
//     reportType: data.reportType,
//     time: data.time,
//   });
// };

// get the report throgh telegram user
const getReport = async (telegramUser) => {
  const reportsCollection = db.collection("Report");
  let reports = [];

  const reportSnapShot = await reportsCollection
    .where("destUser", "==", telegramUser)
    .get();

  if (reportSnapShot.empty) {
    console.log("The data doesn't Exist");
  }

  reportSnapShot.forEach((doc) => {
    reports.push(doc.data());
  });

  return reports;
};

const getAdminsData = async (colc, adminId) => {
  const collection = db.collection(colc);
  let adminsData = [];
  const snapShot = await collection.where("admin_id", "==", adminId).get();

  if (snapShot.empty) {
    throw new Error("There are no data configuration belong to this user");
  }

  snapShot.forEach((doc) => {
    adminsData.push({ id: doc.id, data: doc.data() });
  });

  return adminsData;
};

// ************************************************ Status Report Functions **************************************

// this function will return the docs in a specific collection
const getDoc = async (docId) => {
  console.log(docId);

  const balanceDocs = db.collection("status").doc(docId);
  const snapShot = await balanceDocs.get();

  // this data will include the whole docs arrays
  let data = snapShot.data();

  if (!data) {
    throw new ErrorResponse("Please doc is not exist Please try again");
  }

  // console.log(snapShot);

  return data;
};

// const getAdminStatuses = async (adminId) => {
//   const reportsCollection = db.collection("Report");
//   let adminReports = [];
//   const reportSnapShot = await reportsCollection
//     .where("admin_id", "==", adminId)
//     .get();

//   if (reportSnapShot.empty) {
//     throw new Error("there are no reports configuration stored in this user");
//   }

//   reportSnapShot.forEach((doc) => {
//     adminReports.push({ id: doc.id, data: doc.data() });
//   });

//   return adminReports;
// };
const updateStatus = async (data) => {
  const balanceDocs = await db.collection("status").doc(data.id);
  console.log(balanceDocs);
  console.log(data.id);

  const res = await balanceDocs.update({
    status: data.status,
    reason: data.reason,
  });

  return data;
};

module.exports = {
  limitConfig,
  getDocs,
  userBotConfigModule,
  updateEngine,
  updateLimitOrder,
  getDoc,
  updateStatus,
  getAdminsData,
};
