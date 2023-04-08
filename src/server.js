const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 2528;
const dbUri = process.env.MONGODB_URI;
const routes = require("./routes/routes");
const { scheduler } = require("./scheduler");
const { startAll } = require("./routes/helpers/startAll");
const { log } = require("./routes/helpers/logging");

const mongoose = require("mongoose");

app.use("/api", routes);

// run if in production
if (process.env.NODE_ENV === "production") {
  scheduler();
} else {
  (async () => {
    await startAll();
  })();
}

app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

mongoose.set("strictQuery", false);

// Connect to mongoose
mongoose.connect(
  dbUri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "kushdb",
  },
  (err) => {
    if (err) {
      log("server", "Error connecting to database: ", err);
    } else {
      log(
        "server",
        `Connected to database: ${mongoose.connection.host}:${mongoose.connection.name}`
      );
      app.listen(port, () =>
        log(
          "server",
          `Server is running on ${
            process.env.NODE_ENV === "production"
              ? `port: ${port}`
              : `http://localhost:${port}`
          }`
        )
      );
    }
  }
);
