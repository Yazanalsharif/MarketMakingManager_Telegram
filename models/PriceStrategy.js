const ErrorResponse = require("../utils/ErrorResponse");
const { db } = require("../config/db");

const adminCollection = db.collection("Admin");

// Get the price strategy data and the id from the colleaction
const getPriceStrategy = async (adminId, pairId) => {
  try {
    let priceStrategies = [];

    const priceStSnapshot = await adminCollection
      .doc(adminId)
      .collection("Paris")
      .doc(pairId)
      .collection("priceStrategy")
      .get();

    if (priceStSnapshot.empty) {
      throw new ErrorResponse(
        "There are no price strategy to the pair, Please create one or contact with the admin"
      );
    }

    return priceStSnapshot;
  } finally {
  }
};

const updatePriceStrategy = async (data, adminId, pairId, priceStrId) => {
  try {
    const priceStrCollection = adminCollection
      .doc(adminId)
      .collection("Paris")
      .doc(pairId)
      .collection("priceStrategy")
      .doc(priceStrId);

    // update the status with a specific data that came from the user
    const updatePriceStrategy = await priceStrCollection.update(data);

    return updatePriceStrategy;
  } finally {
  }
};

module.exports = { getPriceStrategy, updatePriceStrategy };
