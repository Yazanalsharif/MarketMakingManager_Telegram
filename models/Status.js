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
      .where("sandbox", "==", true)
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
      .where("sandbox", "==", true)
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
    let statusId = undefined;
    let updateStatus;
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

    // if there are no status  create one
    if (!statusId) {
      updateStatus = await statusCollection.doc().set(data);
    } else {
      // if the status exist
      updateStatus = await statusCollection.doc(statusId).update(data);
    }

    return updateStatus;
  } finally {
    console.log(`The update status function`);
  }
};

module.exports = { getStatuses, updateStatus, getStatusesData };
