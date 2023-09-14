const { db } = require("../config/db");

// Get the notifications data,
const getNotifications = async (adminId) => {
  try {
    let notification = [];

    // only 1 doc must be exist in the notification collection
    const notificationSnapshot = await db
      .collection("admins")
      .doc(adminId)
      .collection("Notification")
      .where("sandbox", "==", true)
      .get();

    if (notificationSnapshot.empty) {
      return undefined;
    }

    notificationSnapshot.forEach((doc) => {
      notification.push({ id: doc.id, data: doc.data() });
    });

    return notification[0];
  } catch (err) {
    console.log(err);
  }
};

const updateNotification = async (data, adminId) => {
  try {
    let notificationId = undefined;
    let updateNotification = undefined;
    const notificationCollection = db
      .collection("admins")
      .doc(adminId)
      .collection("Notification");

    const notificationSnapshot = await notificationCollection.get();

    notificationSnapshot.forEach((doc) => {
      notificationId = doc.id;
    });

    // if there are no status  create one
    if (!notificationId) {
      updateNotification = await notificationCollection.doc().set(data);
    } else {
      // if the status exist
      updateNotification = await notificationCollection
        .doc(notificationId)
        .update(data);
    }

    return updateNotification;
  } finally {
    console.log(`The update notification function`);
  }
};

module.exports = { getNotifications, updateNotification };
