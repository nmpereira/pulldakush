const axios = require("axios");
const { mongoRunner } = require("../helpers/mongoRunner");

const Place420Runner = async () => {
  try {
    const base_url = "https://app.buddi.io";
    const domain = "https://www.the420place.ca";

    const auth_endpoint = "/ropis/auth/get-token";
    const products_endpoint =
      "/ropis/product-collections/all-products/products";

    const company_name = "The420Place";
    const store_id = 5502;

    const auth_url = `${base_url}${auth_endpoint}?domain=${domain}`;
    const auth_response = await axios.get(auth_url);
    const token = auth_response.data.token;
    console.log("token", token);

    const product_response = await axios.get(
      `${base_url}${products_endpoint}?page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "authorization-domain": domain,
        },
      }
    );

    const { last_page, total, per_page } = product_response.data;
    let write_counter = 0;
    const updated_messages = [];
    const start_time = Date.now();
    // for each page, send a request to get the products and push them to an array
    const products = [];
    for await (const page of Array.from(Array(last_page).keys())) {
      const page_response = await axios.get(
        `${base_url}${products_endpoint}?page=${page + 1}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "authorization-domain": domain,
          },
        }
      );
      products.push(...page_response.data.data);
      console.log(
        `420Place: Page ${page + 1} of ${last_page} done || Retrieved ${
          products.length
        }/${total} products.`
      );
    }

    // if products.dispensary.sizes.length > 1, then we need to create a new variation for each size

    const all_variations = products.map((product) => {
      if (product.dispensary.length > 1) {
        console.log("has more than 1 dispensary size");
      }

      return product.dispensary[0].sizes.map((element, index) => {
        const now = new Date();
        return {
          company_name: company_name,
          variation_name: `${
            (product.brand_profile?.name && product.producer?.name) ||
            product.brand_profile?.name ||
            product.producer?.name ||
            product.name
          }-${product.name}-${element.size.weight}`,

          brandname:
            (product.brand_profile?.name && product.producer?.name) ||
            product.brand_profile?.name ||
            product.producer?.name ||
            product.name,

          location_id: store_id,
          displayname: element.size.upc,
          product_id: product.dispensary[0].product_id,
          variationid: element.id,
          total_size: element.size.weight || 0,

          pack_size: element.size.qty_in_pack || "0",
          price: element.price,
          quantityStatus: `N/A`,
          promoPrice: element.discounted_price || element.price,
          productName: product.name,
          updatedAt: now,
        };
      });
    });

    // flatten the array
    const flattened_all_variations = all_variations.flat();

    // create chunks of 25 all_variations
    const chunks = [];
    const chunkSize = 25;
    for (let i = 0; i < flattened_all_variations.length; i += chunkSize) {
      const chunk = flattened_all_variations.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    // variation_documents_chunk
    for await (const variation_document of chunks) {
      const messages_array = [];
      for await (const document of variation_document) {
        write_counter++;
        const write_response = await mongoRunner({
          variation_document: document,
          location_id: store_id,
          company_name,
        });

        if (!write_response) {
          console.log("error", document.id);
          return;
        }

        write_response.action.forEach((action) => {
          if (action.includes("No changes")) {
            messages_array.push(action);
          } else if (action.includes("Created")) {
            messages_array.push(action);
          } else if (action.includes("Updated")) {
            messages_array.push(action);

            messages_array.push(write_response.result.priceHistory);
            messages_array.push(write_response.result.promoPriceHistory);

            updated_messages.push(
              action,
              write_response.result.priceHistory,
              write_response.result.promoPriceHistory
            );
            console.log(
              action,
              write_response.result.priceHistory,
              write_response.result.promoPriceHistory
            );
          }
        });
      }
      console.log(
        "locaionid: ",
        store_id,
        "|| counter:",
        write_counter,
        "|| time:",
        new Date(Date.now() - start_time).toISOString().substr(11, 8)
      );
    }
    console.log(
      "Updated:",
      updated_messages.length,
      "|| messages:",
      updated_messages
    );
    console.log(
      "time:",
      new Date(Date.now() - start_time).toISOString().substr(11, 8)
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = Place420Runner;
