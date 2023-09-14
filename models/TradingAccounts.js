const { db } = require("../config/db");
const { FieldPath } = require("@google-cloud/firestore");

const addNewAccount = async (data) => {
  try {
    const accountSnapShot = db.collection("accounts");

    const accountQuery = await accountSnapShot
      .where(
        new FieldPath("credential", "apiAuth", "key"),
        "==",
        data.credential.apiAuth.key
      )
      .get();

    accountQuery.forEach((doc) => {
      console.log(doc.data());
    });

    if (!accountQuery.empty) {
      return undefined;
    }

    const accountSnapShotDoc = accountSnapShot.doc();

    // insert doc id
    data.id = accountSnapShotDoc.id;
    console.log(data.id);
    // check duplication
    console.log(data);
    const result = await accountSnapShotDoc.set(data);
    return result;
  } catch (err) {
    console.log(err);
  }
};

const getAccounts = async (adminId) => {
  let accounts = [];
  console.log("getting accounts");
  try {
    const accountsSnapShot = await db
      .collection("accounts")
      .where("admin", "==", adminId)
      .where("sandbox", "==", true)
      .get();

    if (accountsSnapShot.empty) {
      return undefined;
    }

    accountsSnapShot.forEach((doc) => {
      accounts.push({ id: doc.id, data: doc.data() });
    });

    return accounts;
  } finally {
    // console.log(err);
  }
};

const getSpecificAccount = async (docId) => {
  try {
    const accountCollection = db.collection("accounts");

    const account = await accountCollection.doc(docId).get();

    return account.data();
  } catch (err) {
    console.log(err);
  }
};

const deleteAccountConfirmation = async (docId) => {
  try {
    const accountCollection = db.collection("accounts");

    const reportDeleted = await accountCollection.doc(docId).delete();

    return reportDeleted;
  } catch (err) {
    console.log(err);
  }
};

// addNewAccount({
//   active: "true",
//   platform: "kucoin",
//   admin: "JzvrgJtx8idJXkw8R8C7RXvnhkE3",
//   engine: "df38e68c-6be6-4ed2-8529-842e2d767259",
//   sandbox: false,
//   credential: {
//     apiAuth: {
//       key: "64883a5d6152270001914618",
//       passphrase: "Yazan2000",
//       secret: "cd85000d-1924-46dc-87e8-269f789f8126",
//     },
//     authVersion: 2,
//     baseUrl: "https://api.kucoin.com",
//   },
// });

module.exports = {
  addNewAccount,
  getAccounts,
  getSpecificAccount,
  deleteAccountConfirmation,
};
