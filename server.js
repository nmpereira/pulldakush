const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const dbUri = process.env.MONGODB_URI;
const axios = require("axios");
const routes = require("./routes/routes");

const mongoose = require("mongoose");

app.use("/api", routes);

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
      console.log("Error connecting to database: ", err);
    } else {
      console.log(
        `Connected to database: ${mongoose.connection.host}:${mongoose.connection.name}`
      );
      app.listen(port, () =>
        console.log(
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
