const express = require("express");
const router = express.Router();

const oneplant = require("./oneplant/oneplant");

router.use("/oneplant", oneplant);

router.get("/", (req, res) => {
  res.status(200).send({ msg: "Unauthorized" });
});

module.exports = router;
