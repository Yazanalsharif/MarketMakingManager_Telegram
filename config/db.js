const mongoose = require("mongoose");
const chalk = require("chalk");

const connecteDB = async () => {
  // to avoid a depractionWarning
  mongoose.set("strictQuery", "false");
  const connect = await mongoose.connect(`${process.env.MONGO_SERVER_URI}`);

  //   log the connection with the Database
  console.log(
    chalk.green.bold(`the DB connect on the uri ${connect.connection.host}`)
  );
};

module.exports = connecteDB;
