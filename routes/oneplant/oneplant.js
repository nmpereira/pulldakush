const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  getOneplantAuth,
  // getOneplantLocations,
  // getOneplantProducts,
  // getOneplantProductPrice,
  // getOneplantVariationPrices,
  // getOneplantAllProductPrices,
} = require("./helpers");
const runner = require("./runner");

const url_prefix = `https://menuapi.waiosoft.com`;

const company_id = "22";
const default_location = "8";

runner({ company_id, url_prefix });

router.get("/", (req, res) => {
  res.status(200).send({ msg: "oneplant" });
});

module.exports = router;
