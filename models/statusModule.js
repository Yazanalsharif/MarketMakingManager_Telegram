const firebase = require("firebase-admin");
const serviceAccount = require("../config/test-app-config.json");
const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");

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

module.exports = { getDoc, updateStatus };
