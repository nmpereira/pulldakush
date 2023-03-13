const { CronJob } = require("cron");

const onePlantRunner = require("./routes/oneplant/onePlantRunner");
const duchieRunner = require("./routes/duchie/duchieRunner");

const scheduler = () => {
  console.log("scheduler");

  //   every 5 seconds
  const cronJob = new CronJob(
    // every 5 hours
    "0 */5 * * *",

    // every 30 minutes
    // "0 */30 * * * *",
    async () => {
      console.log("Starting OnePlant Scheduler", new Date());
      onePlantRunner();

      //  wait 15 mins
      await new Promise((resolve) => setTimeout(resolve, 900000));
      console.log("Starting OnePlant Scheduler", new Date());

      duchieRunner();
    },

    null,
    true,

    "America/New_York"
  );
};

module.exports = {
  scheduler,
};
