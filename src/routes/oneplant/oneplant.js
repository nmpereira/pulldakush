const express = require("express");
const router = express.Router();
const onePlantRunner = require("./onePlantRunner");

router.get("/start", async (req, res) => {
  res.status(200).send({ msg: "Started OnePlant runner" });
  await onePlantRunner();
});
router.get("/", (req, res) => {
  res.status(200).send({ msg: "oneplant" });
});

module.exports = router;
