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

// router.get("/auth", async (req, res) => {
//   try {
//     const { sessionToken } = await getOneplantAuth({
//       date: "1950-01-01",
//       company_id: company_id,
//       location_id: default_location,
//       url_prefix,
//     });

//     res.status(200).send({ sessionToken });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// router.get("/locations", async (req, res) => {
//   try {
//     const location = req.params.location;

//     const { sessionToken } = await getOneplantAuth({
//       date: "1950-01-01",
//       company_id: company_id,
//       location_id: location || default_location,
//       url_prefix,
//     });

//     res.status(200).send({
//       sessionToken,
//       locations: await getOneplantLocations({
//         company_id: company_id,
//         sessionToken,
//         url_prefix,
//       }),
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// router.get("/locations/:location_id/products", async (req, res) => {
//   try {
//     const location = req.params.location_id;

//     const { sessionToken } = await getOneplantAuth({
//       date: "1950-01-01",
//       company_id: company_id,
//       location_id: location || default_location,
//       url_prefix,
//     });

//     res.status(200).send({
//       sessionToken,
//       products: await getOneplantProducts({
//         company_id: company_id,
//         location_id: location,
//         sessionToken,
//         url_prefix,
//       }),
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// router.get("/locations/:location_id/products/:product_id", async (req, res) => {
//   try {
//     const location = req.params.location_id;
//     const product = req.params.product_id;

//     const { sessionToken } = await getOneplantAuth({
//       date: "1950-01-01",
//       company_id: company_id,
//       location_id: location || default_location,
//       url_prefix,
//     });

//     res.status(200).send({
//       sessionToken,
//       product: await getOneplantProductPrice({
//         company_id: company_id,
//         location_id: location,
//         product_id: product,
//         sessionToken,
//         url_prefix,
//       }),
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// router.get(
//   "/locations/:location_id/products/:product_id/prices",
//   async (req, res) => {
//     try {
//       const location = req.params.location_id;
//       const product = req.params.product_id;

//       const { sessionToken } = await getOneplantAuth({
//         date: "1950-01-01",
//         company_id: company_id,
//         location_id: location || default_location,
//         url_prefix,
//       });

//       res.status(200).send({
//         sessionToken,
//         product: await getOneplantVariationPrices({
//           company_id: company_id,
//           location_id: location,
//           product_id: product,
//           sessionToken,
//           url_prefix,
//         }),
//       });
//     } catch (error) {
//       throw new Error(error);
//     }
//   }
// );

// router.get("/locations/:location_id/allprices", async (req, res) => {
//   try {
//     const location = req.params.location_id;
//     const product = req.params.product_id;

//     const { sessionToken } = await getOneplantAuth({
//       date: "1950-01-01",
//       company_id: company_id,
//       location_id: location || default_location,
//       url_prefix,
//     });

//     const all_products = await getOneplantAllProductPrices({
//       company_id: company_id,
//       location_id: location,
//       sessionToken,
//       url_prefix,
//     }).catch((err) => {
//       console.log("Error in getOneplantAllProductPrices: ", err);
//     });

//     res.status(200).send({
//       sessionToken,
//       product: all_products,
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

module.exports = router;
