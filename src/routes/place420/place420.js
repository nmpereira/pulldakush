const express = require("express");
const router = express.Router();

const place420Runner = require("./place420Runner");

router.get("/start", async (req, res) => {
  res.status(200).send({ msg: "Started place420 runner" });
  await place420Runner();
});
router.get("/", (req, res) => {
  res.status(200).send({ msg: "place420" });
});

module.exports = router;
