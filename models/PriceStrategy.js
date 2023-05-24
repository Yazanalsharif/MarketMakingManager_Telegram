const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");

const adminCollection = db.collection("admins");

// Get the price strategy data and the id from the colleaction
const getPriceStrategy = async (adminId, pairId) => {
  try {
    const priceStSnapshot = await adminCollection
      .doc(adminId)
      .collection("pairs")
      .doc(pairId)
      .get();

    if (priceStSnapshot.empty) {
      throw new ErrorResponse(
        "There are no price strategy to the pair, Please create one or contact with the admin"
      );
    }

    let priceStrategy = priceStSnapshot.data().priceStrategy;

    return priceStrategy;
  } finally {
  }
};

const updatePriceStrategy = async (data, adminId, pairId, priceStrId) => {
  try {
    // Get the pair collection to update it
    const pairCollection = adminCollection
      .doc(adminId)
      .collection("pairs")
      .doc(pairId);

    // update the status with a specific data that came from the user
    const updatePriceStrategy = await pairCollection.update({
      // data here is an object
      priceStrategy: data,
    });

    return updatePriceStrategy;
  } finally {
  }
};

module.exports = { getPriceStrategy, updatePriceStrategy };
