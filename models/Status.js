const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");

// Get the status snapshot that belong to the user id
const getStatuses = async (adminId, pairId) => {
  try {
    let stauses = [];

    const statusSnapshot = await db
      .collection("admins")
      .doc(adminId)
      .collection("pairs") //change it to pairs
      .doc(pairId)
      .collection("Status")
      .get();

    if (statusSnapshot.empty) {
      throw new ErrorResponse("There are no statuses belong to the user");
    }

    return statusSnapshot;
  } finally {
  }
};

// Get the status data and id that belong to the user id
const getStatusesData = async (adminId, pairId) => {
  try {
    let statuses = [];

    const statusSnapshot = await db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(pairId)
      .collection("Status")
      .get();

    if (statusSnapshot.empty) {
      return undefined;
    }
    statusSnapshot.forEach((doc) => {
      statuses.push({ id: doc.id, data: doc.data() });
    });

    return statuses;
  } catch (err) {
    console.log(err);
  }
};

const updateStatus = async (data, adminId, pairId) => {
  try {
    let statusId;
    const pairCollection = db
      .collection("admins")
      .doc(adminId)
      .collection("pairs")
      .doc(pairId);

    const statusCollection = pairCollection.collection("Status");

    const statusSnapShot = await statusCollection.get();

    statusSnapShot.forEach((doc) => {
      statusId = doc.id;
    });

    // update the status with a specific data that came from the user
    const updateSnapshot = await statusCollection.doc(statusId).update(data);

    return updateSnapshot;
  } finally {
    console.log(`The update status function`);
  }
};

module.exports = { getStatuses, updateStatus, getStatusesData };
