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
    const modelsSnapshot = await db.collection("engines").get();

    if (modelsSnapshot.empty) {
      throw new ErrorResponse("There are no model");
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
    let engine;

    const engineCollection = db.collection("engines").doc(engineDoc);

    engine = await engineCollection.get();

    return engine.data();
  } finally {
    // console.log("The function has been executed in the Pairs Module");
  }
}

module.exports = { getEngines, getEngineData, ENGINES };
