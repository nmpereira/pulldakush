const Log = require("../../models/Logs");

const log = (...args) => {
  // write the log to mongo
  const source = args[0];
  const message = [...args.slice(1)];

  const now = new Date();

  const log = {
    createdBy: source,
    log: message,
    createdAt: now,
  };

  // write the log to mongo
  Log.create(log);

  // write the log to the console
  console.log(now, ...message);
};

module.exports = {
  log,
};
