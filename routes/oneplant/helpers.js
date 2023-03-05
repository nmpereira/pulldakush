const axios = require("axios");
const mongoose = require("mongoose");
const OnePlant = require("../../models/oneplant");

const getOneplantAuth = async ({
  company_id,
  location_id,
  date,
  url_prefix,
}) => {
  try {
    const auth_token_url = `${url_prefix}/auth/verify/age`;
    const auth_response = await axios
      .post(
        auth_token_url,
        {
          date,
        },
        {
          headers: {
            "waio-company": company_id,
            "waio-location": location_id,
          },
        }
      )
      .catch((error) => {
        console.log("getOneplantAuth error", error);
      });
    const sessionToken = auth_response.data.body.sessionToken;
    console.log("getOneplantAuth", sessionToken);
    return { sessionToken };
  } catch (error) {
    throw new Error(error);
  }
};

const getOneplantLocations = async ({
  company_id,
  sessionToken,
  url_prefix,
}) => {
  try {
    const location_url = `${url_prefix}/locations`;
    const location_response = await axios
      .get(location_url, {
        headers: {
          "waio-company": company_id,
          Authorization: `Bearer ${sessionToken}`,
        },
      })
      .catch((error) => {
        console.log("getOneplantLocations error", error);
      });

    console.log("getOneplantLocations");
    return location_response.data;
  } catch (error) {
    throw new Error(error);
  }
};

const getOneplantProducts = async ({
  company_id,
  location_id,
  sessionToken,
  url_prefix,
}) => {
  try {
    const product_url = `${url_prefix}/location/${location_id}/products`;
    const product_response = await axios
      .get(product_url, {
        headers: {
          "waio-company": company_id,
          Authorization: `Bearer ${sessionToken}`,
        },
      })
      .catch((error) => {
        console.log("getOneplantProducts error", error);
      });
    console.log("getOneplantProducts");
    return product_response.data;
  } catch (error) {
    throw new Error(error);
  }
};

// const getOneplantProductPrice = async ({
//   company_id,
//   location_id,
//   product_id,
//   sessionToken,
//   url_prefix,
// }) => {
//   try {
//     const product_url = `${url_prefix}/location/${location_id}/products/${product_id}`;
//     const product_response = await axios
//       .get(product_url, {
//         headers: {
//           "waio-company": company_id,
//           Authorization: `Bearer ${sessionToken}`,
//         },
//       })
//       .catch((error) => {
//         console.log("getOneplantProductPrice error", error);
//       });
//     console.log(
//       "getOneplantProductPrice",
//       product_id,
//       product_response.data.body
//     );
//     return product_response.data.body;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

const getOneplantVariationPrices = async ({
  company_id,
  location_id,
  product_id,
  sessionToken,
  url_prefix,
}) => {
  try {
    const product_url = `${url_prefix}/location/${location_id}/products/${product_id}`;
    const product_response = await axios
      .get(product_url, {
        headers: {
          "waio-company": company_id,
          Authorization: `Bearer ${sessionToken}`,
        },
      })
      .catch((error) => {
        console.log("getOneplantVariationPrices error", error);
      });

    const variations = product_response.data.body.variations;

    // add product name and brand name to each variation
    variations.forEach((variation) => {
      variation.productName = product_response.data.body.productName;
      variation.brandname = product_response.data.body.brandname;
    });

    return {
      response: variations,
    };
  } catch (error) {
    throw new Error(error);
  }
};

// const getOneplantAllProductPrices = async ({
//   company_id,
//   location_id,
//   sessionToken,
//   url_prefix,
// }) => {
//   try {
//     const product_list = await getOneplantProducts({
//       company_id,
//       location_id,
//       sessionToken,
//       url_prefix,
//     });
//     const cleaned_product_list = product_list.body.products;

//     const product_variations = [];
//     for await (const product of cleaned_product_list) {
//       const product_variation = await getOneplantVariationPrices({
//         company_id,
//         location_id,
//         product_id: product.productId,
//         sessionToken,
//         url_prefix,
//       });
//       console.log("product_variation", product_variation.response);
//       product_variations.push(...product_variation.response);
//     }

//     console.log("getOneplantAllProductPrices", product_variations);
//     return product_variations;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

const getOneplantAllProductIds = async ({
  company_id,
  location_id,
  sessionToken,
  url_prefix,
}) => {
  try {
    const product_list = await getOneplantProducts({
      company_id,
      location_id,
      sessionToken,
      url_prefix,
    });
    const cleaned_product_list = product_list.body.products;

    const product_ids = [];
    for await (const product of cleaned_product_list) {
      product_ids.push(product.productId);
    }

    console.log("getOneplantAllProductIds", product_ids);
    return product_ids;
  } catch (error) {
    throw new Error(error);
  }
};

const mongoRunner = async ({ variation_document, location_id }) => {
  const variation = await OnePlant.findOne({
    variationid: variation_document.variationid,
    location_id,
  });

  variation_document.price = parseFloat(variation_document.price);
  variation_document.memberPrice =
    parseFloat(variation_document.memberPrice) ||
    parseFloat(variation_document.price);
  variation_document.equivalent =
    parseFloat(variation_document.equivalent) || 0;

  const now = Date.now();

  if (!variation) {
    const result = await OnePlant.create({
      ...variation_document,
      location_id,
      priceHistory: {
        [now]: variation_document.price,
      },
      memberPriceHistory: {
        [now]: variation_document.memberPrice,
      },
    });

    return {
      result,

      action: [`Created new variation ${variation_document.variationid}`],
    };
  } else {
    variation.location_id = location_id;

    const action = [];
    if (
      variation.price !== variation_document.price ||
      variation.memberPrice !== variation_document.memberPrice
    ) {
      if (variation.price !== variation_document.price) {
        variation.priceHistory = new Map([
          ...variation.priceHistory,
          [now, variation_document.price],
        ]);

        action.push(
          `Updated variation ${variation_document.variationid} with new price: ${variation_document.price}`
        );
      }
      if (variation.memberPrice !== variation_document.memberPrice) {
        variation.memberPriceHistory = new Map([
          ...variation.memberPriceHistory,
          [now, variation_document.memberPrice],
        ]);
        action.push(
          `Updated variation ${variation_document.variationid} with new member price: ${variation_document.memberPrice}`
        );
      }

      return {
        result: await variation.save(),
        action,
      };
    } else {
      return {
        result: variation,
        action: [`No changes to variation ${variation_document.variationid}`],
      };
    }
  }
};

module.exports = {
  getOneplantAuth,
  getOneplantLocations,
  // getOneplantProducts,
  // getOneplantProductPrice,
  // getOneplantAllProductPrices,
  getOneplantVariationPrices,
  mongoRunner,
  getOneplantAllProductIds,
};
