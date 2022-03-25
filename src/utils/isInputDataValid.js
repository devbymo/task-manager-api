const isInputDataValid = (passedInputData, allowedInputData) => {
  return passedInputData.every((update) => allowedInputData.includes(update));
};

module.exports = isInputDataValid;
