const { getOneplantAllProductIds } = require("./helpers");

const { mongoRunner } = require("../helpers/mongoRunner");

const onePlantRunner = async () => {
  console.log("oneplant script starting...");
  const { getOneplantAuth } = require("./helpers");
  const { getOneplantLocations } = require("./helpers");
  const { getOneplantVariationPrices } = require("./helpers");

  const url_prefix = `https://menuapi.waiosoft.com`;
  const company_id = "22";
  const default_location = "8";
  const start_time = Date.now();
  const company_name = "OnePlant";

  const { sessionToken } = await getOneplantAuth({
    company_id: "22",
    location_id: default_location,
    date: "1950-03-01",
    url_prefix,
  });

  const locations_list_response = await getOneplantLocations({
    company_id,
    sessionToken,
    url_prefix,
  });

  const locations_list = locations_list_response.body.locations
    .map((location) => location.locationid)
    .filter((location) => [8, 3, 33, 15].includes(location));
  // .filter((location) => location === 8);

  console.log("locations_list", locations_list);

  // const variation_documents = [];

  // const variation_documents_chunk = [];
  // const variation_chunk_size = 100;
  let global_counter = 0;
  const updated_messages = [];

  for await (const location_id of locations_list) {
    const items_list = await getOneplantAllProductIds({
      company_id,
      location_id,
      sessionToken,
      url_prefix,
    });

    const items_list_chunk = [];
    const chunk_size = 25;

    for (let i = 0; i < items_list.length; i += chunk_size) {
      items_list_chunk.push(items_list.slice(i, i + chunk_size));
    }

    for (const chunk of items_list_chunk) {
      const variation_promises = chunk.map(async (item) => {
        global_counter++;

        const variation_prices = await getOneplantVariationPrices({
          company_id,
          location_id,
          product_id: item,
          sessionToken,
          url_prefix,
        });

        if (!variation_prices.response.length || !variation_prices.response) {
          return;
        }

        const variation_document = variation_prices?.response[0];

        // rename and delete memberPrice to promoPrice and memberDiscountPercent to promoDiscountPercent
        variation_document.promoPrice = variation_document.memberPrice;
        delete variation_document.memberPrice;

        variation_document.promoDiscountPercent =
          variation_document.memberDiscountPercent;
        delete variation_document.memberDiscountPercent;

        variation_document.variation_name = variation_document.variation;
        delete variation_document.variation;

        variation_document.total_size = variation_document.equivalent;
        delete variation_document.equivalent;

        variation_document.pack_size = variation_document.packsize;
        delete variation_document.packsize;

        variation_document.price = parseFloat(variation_document.price);
        variation_document.promoPrice =
          parseFloat(variation_document.promoPrice) ||
          parseFloat(variation_document.price);
        variation_document.total_size =
          parseFloat(variation_document.total_size) || 0;
        variation_document.originalPrice =
          parseFloat(variation_document.originalPrice) ||
          parseFloat(variation_document.price);
        variation_document.discountPercent =
          parseFloat(variation_document.discountPercent) || 0;
        variation_document.promoDiscountPercent =
          parseFloat(variation_document.promoDiscountPercent) || 0;
        variation_document.location_id = location_id;

        return variation_document;
      });

      const variation_documents = await Promise.all(variation_promises);

      // for (
      //   let i = 0;
      //   i < variation_documents.length;
      //   i += variation_chunk_size
      // ) {
      //   variation_documents_chunk.push(
      //     variation_documents.slice(i, i + variation_chunk_size)
      //   );
      // }

      const messages_array = [];
      for await (const document of variation_documents) {
        const write_response = await mongoRunner({
          variation_document: document,
          location_id,
          company_name,
        });

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
        location_id,
        "|| counter:",
        global_counter,
        "|| time:",
        new Date(Date.now() - start_time).toISOString().substr(11, 8)
      );
    }
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

  console.log("done with all locations");

  return;
};

module.exports = onePlantRunner;
