//to color the cmd outputs
const chalk = require("chalk");
const ErrorResponse = require("./ErrorResponse");

// Handle The error using the bot
const errorHandlerBot = (ctx, err) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === "CastError") {
    const message = `resourses not found by the id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message);
  }

  if (err.code === 11000) {
    const message = `Duplicate field value enterned`;
    error = new ErrorResponse(message);
  }

  ctx.reply(`${error.message}`);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  //casting error which some of the fields need a data type and entered with a different data type like the ObjectId
  if (err.name === "CastError") {
    const message = `resourses not found by the id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //for duplicate the fields in the database mongodb which one of the field must be uniqe for example the name
  if (err.code === 11000) {
    const message = "Duplicate field value enterned";
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "ValidationError") {
    //here we took the valuse from the errors object and we maped it to get the messages values
    const message = Object.values(err.errors).map((val) => val.message);
    //send the error via ErrorResponse class
    error = new ErrorResponse(message, 400);
  }
  // if(err.name === "")
  //here is the error and it will be the html error which we have to edit it
  console.log(chalk.red(err.stack));
  res
    .status(error.statusCode || 500)
    .json({ success: false, msg: error.message || "Server Error" });
};

module.exports = { errorHandlerBot, errorHandler };
