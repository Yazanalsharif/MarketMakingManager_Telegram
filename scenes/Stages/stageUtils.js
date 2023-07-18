function contentShouldEdit(ctx) {
  let shouldEdit = false;
  if (ctx.wizard.state.shouldEdit) {
    shouldEdit = true;
    ctx.wizard.state.shouldEdit = false;
  } else if (ctx.wizard.state.shouldEdit === undefined) {
    ctx.wizard.state.shouldEdit = false;
    shouldEdit = true;
  } else {
    shouldEdit = false;
  }
  return shouldEdit;
}

function checkOptions(options, query) {
  for (let option of options) {
    if (option.id === query) {
      return true;
    }
  }
  return false;
}

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

function resetStage(ctx) {
  ctx.wizard.state.message = undefined;
  ctx.wizard.state.title = undefined;
  ctx.wizard.state.shouldEdit = true;
  ctx.wizard.state.firstEntry = true;
  ctx.wizard.state.helpMode = false;
}

function stringLenght(value) {
  if (typeof value === "string") {
    return value.length;
  }

  return undefined;
}

const verifyTime = async (time) => {
  try {
    const timeArray = time.split(":");

    // check if the timeArray is right
    if (!timeArray && timeArray.length === 0) {
      return undefined;
    }

    let hours = parseInt(timeArray[0]);
    let minutes = parseInt(timeArray[1]);

    // the hours will be in first item and the minutes will be the second item
    if (isNaN(hours) || isNaN(minutes)) {
      return undefined;
    }

    if (timeArray[1].length === 1) {
      timeArray[1] *= 10;
    }

    if (timeArray[1].length > 2) {
      return undefined;
    }

    // if (timeArray[1].trim().length > 1 && minutes <= 5) {
    //   minutes = timeArray[1] * 10;
    // } else {
    //   minutes = timeArray[1];
    //   console.log(minutes);
    // }

    // check if the numbers is time or not
    if (
      0 <= timeArray[0] &&
      timeArray[0] <= 23 &&
      0 <= timeArray[1] &&
      timeArray[1] <= 59
    ) {
      let verifiedTime = timeArray[0] + ":" + timeArray[1];

      console.log(verifiedTime);
      console.log(timeArray[1]);

      return verifiedTime;
    }

    return undefined;
    // console.log(timeArray);
  } catch (err) {
    console.log(err);
  }
};

const removeItemArray = async (array, item) => {
  try {
    let index = array.indexOf(item);

    if (index > -1) {
      array.splice(index);
    }
  } catch (err) {
    console.log(err);
  }
};

const removeArraysArray = async (baseArray, deletedArray) => {};

module.exports = {
  contentShouldEdit,
  checkOptions,
  isNumeric,
  resetStage,
  verifyTime,
  stringLenght,
  removeItemArray,
};
