const onePlantRunner = require("../oneplant/onePlantRunner");
const duchieRunner = require("../duchie/duchieRunner");
const Place420Runner = require("../place420/place420Runner");

const startAll = async () => {
  // start time
  const startTime = new Date();
  await onePlantRunner();
  await duchieRunner();
  await Place420Runner();

  //   log time
  const endTime = new Date();
  // log difference in hh:mm:ss

  console.log(
    "Completed all runners in: ",
    new Date(Date.now() - startTime).toISOString().substr(11, 8)
  );
};

module.exports = {
  startAll,
};
