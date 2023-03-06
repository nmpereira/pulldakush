// const {
//   getOneplantAuth,
//   getOneplantVariationPrices,
//   mongoRunner,
//   getOneplantAllProductIds,
//   getOneplantLocations,
// } = require("./helpers");

// const runner = async ({
//   company_id,
//   url_prefix = "https://menuapi.waiosoft.com",
// }) => {
//   const { sessionToken } = await getOneplantAuth({
//     company_id: "22",
//     location_id: "8",
//     date: "1950-03-01",
//     url_prefix: "https://menuapi.waiosoft.com",
//   });

//   const locations_list_response = await getOneplantLocations({
//     company_id,
//     sessionToken,
//     url_prefix,
//   });

//   const locations_list = locations_list_response.body.locations
//     .map((location) => location.locationid)
//     .filter((location) => location === 8);

//   console.log("locations_list", locations_list);
//   let global_counter = 0;
//   const time_start = Date.now();

//   for (const location_id of locations_list) {
//     const items_list = await getOneplantAllProductIds({
//       company_id,
//       location_id,
//       sessionToken,
//       url_prefix,
//     });
//     let counter = 0;

//     for await (const item of items_list) {
//       counter++;
//       global_counter++;
//       const variation_prices = await getOneplantVariationPrices({
//         company_id,
//         location_id,
//         product_id: item,
//         sessionToken,
//         url_prefix,
//       });

//       const variation_document = variation_prices.response[0];

//       variation_document.price = parseFloat(variation_document.price);
//       variation_document.memberPrice =
//         parseFloat(variation_document.memberPrice) ||
//         parseFloat(variation_document.price);
//       variation_document.equivalent =
//         parseFloat(variation_document.equivalent) || 0;

//       // const response = await mongoRunner({ variation_document, location_id });

//       console.log(
//         "Count",
//         counter,
//         "of",
//         items_list.length,
//         "of",
//         global_counter,
//         "|| for location",
//         location_id,
//         "|| time elapsed (hh:mm:ss): ",
//         new Date(Date.now() - time_start).toISOString().substr(11, 8)
//       );

//       response.action.forEach((action) => {
//         if (action.includes("No changes")) {
//           console.log(action);
//         } else if (action.includes("Created")) {
//           console.log(action);
//           console.log("priceHistory", response.result.priceHistory);
//           console.log("memberPriceHistory", response.result.memberPriceHistory);
//         } else if (action.includes("Updated")) {
//           console.log(action);
//           console.log("priceHistory", response.result.priceHistory);
//           console.log("memberPriceHistory", response.result.memberPriceHistory);
//         }
//       });
//     }
//   }
// };

// module.exports = runner;
