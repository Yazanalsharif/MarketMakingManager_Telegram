require("dotenv").config({
  path: "./config/.env",
});
const express = require("express");
const chalk = require("chalk");
const morgan = require("morgan");
const api = require("./Api/api");
const { errorHandler } = require("./utils/errorHandler");
// launch the server function
const server = () => {
  const app = express();

  const port = process.env.PORT || 3000;

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use(express.json());

  // mount the routes here
  app.use("/api/v1", api);

  app.use(errorHandler);

  app.use("*", async (req, res) => {
    res.status(400).json({
      success: false,
      msg: "There is end point it doesn't Exist",
    });
  });

  const launch = app.listen(port, () => {
    console.log(
      chalk.white.bgYellow.bold(
        `the server is runing on port ${port} and in the ${process.env.NODE_ENV} enviorment`
      )
    );
  });

  process.on("unhandledRejection", (err) => {
    console.log(chalk.red(`Error: ${err.message}`));

    launch.close(() => process.exit(1));
  });
};

module.exports = server;
