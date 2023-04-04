const firebase = require("firebase-admin");
const serviceAccount = require("../config/test-app-config.json");
const ErrorResponse = require("../utils/ErrorResponse");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

const db = firebase.firestore();
db.settings({ ignoreUndefinedProperties: true });

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

module.exports = { limitConfig, getDocs, userBotConfigModule, updateEngine };
