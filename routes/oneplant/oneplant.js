const express = require("express");
const router = express.Router();

const onePlantRunner = require("./onePlantRunner");

console.log("oneplant script starting...");
onePlantRunner();

router.get("/", (req, res) => {
  res.status(200).send({ msg: "oneplant" });
});

module.exports = router;
