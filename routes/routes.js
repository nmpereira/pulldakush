const express = require("express");
const router = express.Router();
const startAll = require("./helpers/startAll");

const oneplant = require("./oneplant/oneplant");
router.use("/oneplant", oneplant);

const duchie = require("./duchie/duchie");
router.use("/duchie", duchie);

router.get("/", (req, res) => {
  res.status(200).send({ msg: "Unauthorized" });
});

router.get("/startall", async (req, res) => {
  await startAll();
  res.status(200).send({ msg: "Started all runners" });
});

module.exports = router;
