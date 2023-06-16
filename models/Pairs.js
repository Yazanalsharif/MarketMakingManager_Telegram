const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");

// Get the pairs that belong to the user id
const getPairs = async (adminId) => {
  try {
    let pairs = [];

    const pairSnapshot = await db
      .collection("admins")
      .doc(adminId)
      .collection("pairs") //change it to pairs
      .get();

    if (pairSnapshot.empty) {
      throw new ErrorResponse(
        "There are no pairs belong to the user, Please make sure you have pairs first"
      );
    }

    pairSnapshot.forEach((doc) => {
      pairs.push({ id: doc.id, data: doc.data() });
    });

    return pairs;
  } finally {
    // console.log(err);
  }
};

// Get selected pair by the docId and the adminId
const getPair = async (docId, adminId) => {
  try {
    let pair;

    const pairSnapshot = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(docId);

    pair = await pairSnapshot.get();

    return pair.data();
  } finally {
    // console.log("The function has been executed in the Pairs Module");
  }
};

const updatePair = async (data, adminId, docId) => {
  try {
    const pairSnapshot = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(docId);

    const update = await pairSnapshot.update(data);
  } catch (err) {
    console.log(err);
  }
};

const addNewPair = async (data, adminId) => {
  try {
    const pairSnapshot = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc();

    const result = await pairSnapshot.set(data);
    return result;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getPairs, getPair, updatePair, addNewPair };
