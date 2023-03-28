const firebase = require("firebase-admin");
const serviceAccount = require("../config/test-app-config.json");
const ErrorResponse = require("../utils/ErrorResponse");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

const db = firebase.firestore();

const amountLimitColloction = async (data) => {
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

  // update the values of the in the collection and docs
  const amountLimit = await db
    .collection(data.collection)
    .doc(data.doc)
    .update({
      limit: parseFloat(data.limit),
      enable: data.enable,
    });

  console.log(amountLimit);
};

module.exports = { amountLimitColloction };
