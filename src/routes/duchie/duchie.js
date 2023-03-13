const express = require("express");
const router = express.Router();

const duchieRunner = require("./duchieRunner");

router.get("/start", async (req, res) => {
  res.status(200).send({ msg: "Started duchie runner" });
  await duchieRunner();
});
router.get("/", (req, res) => {
  res.status(200).send({ msg: "duchie" });
});

module.exports = router;
