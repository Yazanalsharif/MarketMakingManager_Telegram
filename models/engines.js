const { db } = require("../config/db");

let ENGINES = {};
getEngines().then((result) => {
  ENGINES = result;
});

// Get all models
async function getEngines() {
  let engines = {};
  console.log("getting Engines");
  try {
    const modelsSnapshot = await db
      .collection("engines")
      .where("sandbox", "==", true)
      .get();

    if (modelsSnapshot.empty) {
      // throw new ErrorResponse("There are no model");
      return undefined;
    }

    modelsSnapshot.forEach((doc) => {
      engines[doc.id] = doc.data();
    });

    return engines;
  } finally {
    // console.log(err);
  }
}

async function getEngineData(engineDoc) {
  try {
    let engine = {};

    const engineCollection = db
      .collection("engines")
      .where("sandbox", "==", false);

    let engines = await engineCollection.get();

    engines.forEach((eng) => {
      if (eng.id === engineDoc) {
        engine.id = eng.id;
        engine.data = eng.data();
      }
    });
    console.log(engine);
    return engine?.data;
  } finally {
    // console.log("The function has been executed in the Pairs Module");
  }
}
getEngineData("kucoin");

module.exports = { getEngines, getEngineData, ENGINES };
