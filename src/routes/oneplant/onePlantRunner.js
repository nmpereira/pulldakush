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

  const store_url = `https://www.oneplant.ca`;
  let linkToStore = `${store_url}/locations/`;

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

  const location_addresses = locations_list_response.body.locations.map(
    (location) => {
      return {
        location_id: location.locationid,
        address: location.storeaddress,
        storeName: location.storename,
      };
    }
  );

  const locations_list = location_addresses
    .filter(
      // (location) => location.location_id === 8
      (location) =>
        // [8, 3, 33, 15].includes(location)
        [8, 33].includes(location.location_id)
    )
    .map((location) => location.location_id);
  console.log("locations_list", locations_list);

  let global_counter = 0;
  const updated_messages = [];

  for await (const location_id of locations_list) {
    const locationName = location_addresses.find(
      (location) => location.location_id === location_id
    ).storeName;

    const locationAddress = location_addresses.find(
      (location) => location.location_id === location_id
    ).address;

    if (location_id === 8) {
      linkToStore = `${linkToStore}north-york`;
    } else if (location_id === 33) {
      linkToStore = `${linkToStore}toronto-avenue-road`;
    }

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

        const variation_document = variation_prices.response.map((doc) => {
          global_counter++;
          // rename and delete memberPrice to promoPrice and memberDiscountPercent to promoDiscountPercent
          doc.promoPrice = doc.memberPrice;
          delete doc.memberPrice;

          doc.promoDiscountPercent = doc.memberDiscountPercent;
          delete doc.memberDiscountPercent;

          doc.variation_name = doc.variation;
          delete doc.variation;

          doc.total_size = doc.equivalent;
          delete doc.equivalent;

          doc.pack_size = doc.packsize;
          delete doc.packsize;

          doc.price = parseFloat(doc.price);
          doc.promoPrice = parseFloat(doc.promoPrice) || parseFloat(doc.price);
          doc.total_size = parseFloat(doc.total_size) || 0;
          doc.originalPrice =
            parseFloat(doc.originalPrice) || parseFloat(doc.price);
          doc.discountPercent = parseFloat(doc.discountPercent) || 0;
          doc.promoDiscountPercent = parseFloat(doc.promoDiscountPercent) || 0;
          doc.location_id = location_id;

          return doc;
        });
        if (variation_document.length > 1) {
          console.log(item, `has ${variation_document.length} variations`);
        }

        return variation_document;
      });

      const variation_documents = [];
      for await (const document of variation_promises) {
        if (document) {
          variation_documents.push(...document);
        }
      }

      const messages_array = [];
      for await (const document of variation_documents) {
        let linkToProduct = `${linkToStore}#/products/${document.product_id}`;

        const clean_document = {
          company_name: company_name,
          brandname: document.brandname,
          location_id: document.location_id,
          displayname: document.displayname,
          product_id: document.product_id,
          variationid: document.variationid,
          variation_name: document.variation_name,
          total_size: document.total_size,
          pack_size: document.pack_size,
          price: document.price,
          quantityStatus: document.quantityStatus,
          promoPrice: document.promoPrice,
          productName: document.productName,
        };

        const write_response = await mongoRunner({
          variation_document: clean_document,
          location_id,
          company_name,
          locationName,
          locationAddress,
          linkToProduct,
          linkToStore,
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
