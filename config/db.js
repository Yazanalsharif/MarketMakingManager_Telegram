const mongoose = require("mongoose");
const chalk = require("chalk");
const firebase = require("firebase-admin");
const serviceAccount = require("./falconsFirebaseConfig.json");

// const connecteDB = async () => {
//   // to avoid a depractionWarning
//   mongoose.set("strictQuery", "false");
//   const connect = await mongoose.connect(`${process.env.MONGO_SERVER_URI}`);

//   //   log the connection with the Database
//   console.log(
//     chalk.green.bold(`the DB connect on the uri ${connect.connection.host}`)
//   );
// };

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

const db = firebase.firestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { db, firebase };
