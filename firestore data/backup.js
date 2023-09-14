const fs = require("fs");
const { db } = require("../config/db");

const importJsonData = (path) => {
  fs.readFile("./backup.json", { encoding: "utf-8" }, async (err, data) => {
    // if there are any error leave the funcitons
    if (err) {
      console.log(err);
      return;
    }

    const dataObject = JSON.parse(data);
    // console.log(dataObject.__collections__);
    const collections = dataObject.__collections__;

    const adminCollectionData = collections.admins;
    const botConfigCollectionData = collections.bot_config;
    const enginesCollectionData = collections.engines;
    const accountsCollectionData = collections.accounts;

    // console.log("admins collection data", adminCollectionData);

    // console.log(enginesCollectionData.kucoin.__collections__);

    const engineCollection = db.collection("engines");
    const bot_configCollection = db.collection("bot_config");
    const adminCollection = db.collection("admins");
    const accountsCollection = db.collection("accounts");

    // add the engine collection to the firestore
    // await addData(engineCollection, enginesCollectionData);
    await addData(adminCollection, adminCollectionData);
    // await addData(bot_configCollection, botConfigCollectionData);
    // await addData(accountsCollection, accountsCollectionData);
  });
};

const addData = async (collection, documentData) => {
  // const collection = db.collection(admins);
  try {
    const documentsKeys = Object.keys(documentData);
    let subCollectionData = {};
    let subCollectionsKeys;

    for (let i = 0; i < documentsKeys.length; i++) {
      console.log(documentData[documentsKeys[i]].__collections__);

      if (documentData[documentsKeys[i]].__collections__) {
        // Take the keys of the sub-collections
        subCollectionsKeys = Object.keys(
          documentData[documentsKeys[i]].__collections__
        );

        // store the sub-collection data in the object with key of the sub-collection name
        subCollectionsKeys.forEach((key) => {
          subCollectionData[key] =
            documentData[documentsKeys[i]].__collections__[key];
        });

        // remove the collection object because it can't be stored
        delete documentData[documentsKeys[i]].__collections__;
        // add the document data with the document key
        await collection
          .doc(documentsKeys[i])
          .set(documentData[documentsKeys[i]]);

        //  add the sub-collection data to the sub-collection document
        for (let x = 0; x < subCollectionsKeys.length; x++) {
          addData(
            collection.doc(documentsKeys[i]).collection(subCollectionsKeys[x]),
            subCollectionData[subCollectionsKeys[x]]
          );
        }
      } else {
        // remove the collection object because it can't be stored
        delete documentData[documentsKeys[i]]?.__collections__;
        await collection
          .doc(documentsKeys[i])
          .set(documentData[documentsKeys[i]]);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

// const colc = db.collection(collection);
//   try {
//     //   if you want to specify the document name
//     const collectionDoc = Object.keys(data);

//     collectionDoc.forEach(async (key) => {
//       colc.doc(key);

//       if (collection[key].__collections__) {
//         const subCollections = data[key].__collections__;
//         const subCollectionsKeys = Object.keys(subCollections);
//         delete collection[key].__collections__;
//       }
//       await colc.add(collection[key]);
//       console.log("The engine has been added");
//       subCollections.forEach(async (subKey) => {});
//     });
//   } catch (err) {
//     console.log(err.message);
//   }

// This function works with the documents that has no sub object or maps
// engineCollection, bot_configCollection
const importData = async (collection, data) => {
  try {
    // engine collection
    // console.log(collection);
    const keys = Object.keys(data);

    console.log("Keys is ", keys);
    console.log(data);

    keys.forEach(async (key) => {
      if (data[key].__collections__) {
        const subCollection = data[key].__collections__;
        const subCollectionKey = Object.keys(data[key].__collections__);
        delete data[key].__collections__;

        await collection.doc(key).set(data[key]);
        console.log(key);
        console.log("added data", data[key]);

        console.log(subCollectionKey);
        console.log(subCollectionKey);

        return importData(
          collection.doc(key).collection(subCollectionKey[0]),
          subCollection
        );
      } else {
        const keys = Object.keys(data[key]);
        keys.forEach(async (key1) => {
          delete data[key][key1].__collections__;
          await collection.doc(key1).set(data[key][key1]);
          console.log("The data has been added", data[key][key1]);
        });
        console.log(key);
        // await collection.doc(key).set(data);
      }
    });
    // subCollections depth
  } catch (err) {
    console.log(err.message);
  }
};

importJsonData("./backup.json");
