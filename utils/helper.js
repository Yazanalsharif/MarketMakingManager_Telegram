const ErrorResponse = require("./ErrorResponse");

const checkNumber = (text) => {
  if (!text) {
    throw new ErrorResponse("Please Enter The Limit value");
  }

  text = text.split(" ");
  let limitValue;

  for (let i = 0; i < text.length; i++) {
    if (!isNaN(text[i])) {
      limitValue = text[i];
      return;
    }
  }

  return limitValue;
};

const checkWord = (text, word) => {
  if (!text) {
    throw new ErrorResponse("Please Enter The Limit value");
  }
  text = text.toLowerCase();
  text = text.split(" ");

  for (let i = 0; i < text.length; i++) {
    if (text[i] === word) {
      return true;
    }
  }

  return false;
};

module.exports = { checkNumber, checkWord };
