const express = require("express");
const router = express.Router();

const duchieRunner = require("./duchieRunner");

router.get("/start", async (req, res) => {
  duchieRunner();
  res.status(200).send({ msg: "Started duchie runner" });
});
router.get("/", (req, res) => {
  res.status(200).send({ msg: "duchie" });
});

module.exports = router;
