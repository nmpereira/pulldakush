const { CronJob } = require("cron");

const onePlantRunner = require("./routes/oneplant/onePlantRunner");
const duchieRunner = require("./routes/duchie/duchieRunner");
const { startAll } = require("./routes/helpers/startAll");
const { log } = require("./routes/helpers/logging");

const scheduler = () => {
  log("scheduler", "scheduler");

  //   every 5 seconds
  const cronJob = new CronJob(
    // every 5 hours
    // "0 */5 * * *",
    // every 1 hour
    "0 */20 * * *",

    // every 30 minutes
    // "0 */30 * * * *",
    async () => {
      // log("scheduler","Starting OnePlant Scheduler", new Date());
      // onePlantRunner();
      // //  wait 15 mins
      // await new Promise((resolve) => setTimeout(resolve, 900000));
      // log("scheduler","Starting OnePlant Scheduler", new Date());
      // duchieRunner();

      await startAll();
    },

    null,
    true,

    "America/New_York"
  );
};

module.exports = {
  scheduler,
};
