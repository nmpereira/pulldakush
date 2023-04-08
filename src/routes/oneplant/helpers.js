const axios = require("axios");
const { log } = require("../helpers/logging");

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
        log("helpers", "getOneplantAuth error", error);
      });
    const sessionToken = auth_response.data.body.sessionToken;
    log("helpers", "getOneplantAuth", sessionToken);
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
        log("helpers", "getOneplantLocations error", error);
      });

    log("helpers", "getOneplantLocations");
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
        log("helpers", "getOneplantProducts error", error);
      });

    return product_response.data;
  } catch (error) {
    throw new Error(error);
  }
};

const getOneplantVariationPrices = async ({
  company_id,
  location_id,
  product_id,
  sessionToken,
  url_prefix,
}) => {
  try {
    // log("helpers","getOneplantVariationPrices", product_id);
    const product_url = `${url_prefix}/location/${location_id}/products/${product_id}`;
    const product_response = await axios
      .get(product_url, {
        headers: {
          "waio-company": company_id,
          Authorization: `Bearer ${sessionToken}`,
        },
      })
      .catch((error) => {
        if (product_response?.syscall === "getaddrinfo") {
          log(
            "helpers",
            "Invalid response from API call (data undefined)",
            error
          );
          return null;
        }
        log("helpers", "getOneplantVariationPrices error", error);
      });

    if (product_response.data.statusCode !== 200) {
      if (product_response.data.statusCode === 404) {
        if (
          product_response.data.body === "Product not found, or not in stock."
        ) {
          log(
            "helpers",
            "404 handled for",
            product_id,
            "at",
            location_id,
            "response:",
            product_response.data
          );
          return null;
        }
        log("helpers", "404 unhanded:", product_response.data);
      }
      log(
        "helpers",
        "Error: Non-404 code received for",
        product_id,
        "at",
        location_id,
        "response:",
        product_response.data
      );
    }

    if (
      product_response &&
      product_response?.data &&
      product_response?.data?.body &&
      product_response?.data?.body?.variations
    ) {
      const variations = product_response.data.body.variations;

      // add product name and brand name to each variation
      variations.forEach((variation) => {
        variation.productName = product_response.data.body.productName;
        variation.brandname = product_response.data.body.brandname;
        variation.product_id = product_id;
      });

      return {
        response: variations,
      };
    } else {
      log("Invalid response from API call", product_response.data.errorMessage);
    }
  } catch (error) {
    log("helpers", "THROWN error", error);
    throw new Error(error);
  }
};

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

    log("helpers", "getOneplantAllProductIds for:", location_id, product_ids);
    return product_ids;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getOneplantAuth,
  getOneplantLocations,
  getOneplantVariationPrices,
  getOneplantAllProductIds,
};
