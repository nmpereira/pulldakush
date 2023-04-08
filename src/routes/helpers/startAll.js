const onePlantRunner = require("../oneplant/onePlantRunner");
const duchieRunner = require("../duchie/duchieRunner");
const Place420Runner = require("../place420/place420Runner");

const startAll = async () => {
  // start time
  const startTime = new Date();

  // pick one randomly
  const runners = [onePlantRunner, duchieRunner, Place420Runner];
  // rearrange the array randomly
  const randomRunners = runners.sort(() => Math.random() - 0.5);
  console.log("randomRunners", randomRunners);

  // run all runners
  for await (const runner of randomRunners) {
    await runner();
  }

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
